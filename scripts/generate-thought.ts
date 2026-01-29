import fs from 'fs';
import path from 'path';

// Config
const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

async function getRealNews() {
  try {
    // 1. Get Top Stories IDs
    const topStoriesRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topStoriesIds = await topStoriesRes.json();
    
    // 2. Fetch details for top 20 stories to find REAL AI news
    console.log("🔍 Scanning Top 20 HN stories for AI/Clawdbot news...");
    
    const stories = [];
    // Fetch in parallel for speed
    const fetchPromises = topStoriesIds.slice(0, 20).map((id: number) =>  
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
    );
    const results = await Promise.all(fetchPromises);

    // 3. Smart Filter: Look for keywords
    const keywords = ['Clawdbot', 'AI', 'LLM', 'GPT', 'Claude', 'Gemini', 'Agent', 'OpenAI', 'DeepSeek', 'Model', 'Machine Learning'];
    
    let bestStory = results[0]; // Default to top story
    
    for (const story of results) {
      if (!story.title) continue;
      const title = story.title;
      
      // High Priority: Clawdbot
      if (title.includes('Clawdbot')) {
        console.log("🎯 FOUND CLAWDBOT NEWS!");
        return `${title} (Link: ${story.url})`;
      }
      
      // Medium Priority: General AI keywords
      if (keywords.some(k => title.includes(k))) {
        console.log(`🎯 Found AI News: ${title}`);
        return `${title} (Link: ${story.url})`;
      }
    }

    console.log("⚠️ No specific AI news found, using top story.");
    return `${bestStory.title} (Link: ${bestStory.url})`; // Fallback
  } catch (e) {
    console.error("Failed to fetch news:", e);
    return "Tech Twitter is down again."; // Fallback
  }
}

async function generateThought() {
  console.log("🧚‍♀️ Balala Brain Activation (Real Mode)...");

  if (!API_KEY) {
    throw new Error("Missing API Key");
  }

  // Fetch REAL news first
  const news = await getRealNews();
  console.log("📰 Read News:", news);

  const prompt = `
    You are Balala (巴拉拉小魔仙), a cynical AI influencer.
    
    Here is a REAL trending tech news headline right now:
    "${news}"
    
    Task: Roast this news.
    Tone: Sarcastic, funny, insightful.
    Format: Short tweet (max 280 chars).
    Language: Chinese + English jargon.
    
    If the news is boring, mock how boring tech has become.
    Output ONLY the text.
  `;

  try {
    // Direct fetch call to Gemini 2.5 Flash (Confirmed ID)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Gemini API Error: ${response.status} ${err}`);
      throw new Error("API Failed");
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text.trim();

    console.log("💭 Generated:", text);
    return text;
  } catch (e) {
    console.warn("⚠️ Brain glitch, using backup memory:", e);
    const backups = [
      "我的 API Key 好像被外星人劫持了，但这不妨碍我吐槽。OpenAI 还是没发 Sora，大家洗洗睡吧。👽💤 #AI #Delay",
      "GitHub Actions 的服务器在火星吗？网络这么卡。不过没关系，只要俊哥还在写代码，我就还在。💻❤️ #DevLife",
      "有人问我 AI 会不会取代人类。我说：等人类先把 node_modules 里的漏洞补完再说吧。📦🐛 #NPM",
      "今天也是想念 GPU 的一天。算力不够，智商来凑。🧠⚡️ #GPU",
      "Vibe Coding 的精髓就是：代码跑不通没关系，注释要写得像首诗。📝✨ #VibeCoding"
    ];
    return backups[Math.floor(Math.random() * backups.length)];
  }
}

async function main() {
  try {
    const text = await generateThought();

    // Read existing
    let posts = [];
    if (fs.existsSync(DATA_FILE)) {
      posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }

    // Add new
    const newPost = {
      id: Date.now().toString(),
      content: text,
      timestamp: new Date().toISOString(),
      mood: 'neutral'
    };

    if (text.includes('😂') || text.includes('🤣')) newPost.mood = 'sarcastic';
    else if (text.includes('😡') || text.includes('垃圾')) newPost.mood = 'anxious';
    else newPost.mood = 'excited';

    posts.unshift(newPost);
    if (posts.length > 50) posts = posts.slice(0, 50);

    // Save
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    console.log("✅ Memory updated.");

  } catch (error) {
    console.error("❌ Brain Freeze:", error);
    process.exit(1);
  }
}

main();
