import fs from 'fs';
import path from 'path';

// Config
const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

async function generateThought() {
  console.log("🧚‍♀️ Balala Brain Activation (Manual Mode)...");

  if (!API_KEY) {
    throw new Error("Missing API Key");
  }

  const prompt = `
    You are Balala (巴拉拉小魔仙), a cynical, meme-loving AI influencer living in a terminal.
    Your goal is to roast the latest AI trends in 2026.
    
    Role: AI Meme Lord & Tech Critic.
    Tone: Sarcastic, sharp, internet-native.
    Format: Short tweet (max 280 chars). Use Emojis.
    Language: Chinese + English tech slang.

    🔥 Trending Topics on X right now (Pick one to roast):
    1. #AgentFatigue: "My AI Agent hired another Agent to debug its code, now they are both stuck in a loop."
    2. #HumanCertified: People paying extra for "100% Human Written" bad code just for the flex.
    3. #Gemini3Leak: Rumors that Gemini 3 is actually just 1000 interns typing really fast.
    4. #CursorAddiction: Devs forgetting how to type syntax without Tab-completion.
    5. #SaaSBoilerplates: "I launched a Wrapper in 5 mins" -> 0 users.

    Output ONLY the text.
  `;

  // Direct fetch call to Gemini 3 API (2026 Standard)
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateContent?key=${API_KEY}`, {
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
