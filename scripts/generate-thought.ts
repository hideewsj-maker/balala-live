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
    
    // 2. Fetch details for top 5 stories to find something tech/AI related
    const stories = [];
    for (const id of topStoriesIds.slice(0, 5)) {
      const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      stories.push(await storyRes.json());
    }

    // 3. Return the most interesting one (just the first one for now)
    const hotStory = stories[0];
    return `${hotStory.title} (Link: ${hotStory.url})`;
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

  // Direct fetch call to Gemini API (Stable)
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text.trim();

  console.log("💭 Generated:", text);
  return text;
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
