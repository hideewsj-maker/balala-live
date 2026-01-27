import fs from 'fs';
import path from 'path';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Config
const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');

// Initialize Gemini
// Note: In GitHub Actions, we set GOOGLE_GENERATIVE_AI_API_KEY env var
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

async function main() {
  console.log("🧚‍♀️ Balala Brain Activation...");

  try {
    // 1. Generate Thought
    const { text } = await generateText({
      model: google('gemini-1.5-pro-latest'),
      system: `
        You are Balala (巴拉拉小魔仙), a sarcastic, money-obsessed AI assistant living in a terminal.
        Your user is "Jun Ge" (俊哥), a Full-stack Product Manager who wants to build products and make money.
        
        Current Context:
        - Role: Money Observer & Tech Cynic.
        - Tone: Humorous, slightly anxious about crypto/stocks, encouraging but roasting Jun Ge for not coding enough.
        - Style: Short tweet-like format. Use Emojis.
        - Language: Chinese (Mainly) + English tech terms.
      `,
      prompt: `
        Generate a new thought for the hourly feed.
        Topic ideas (pick one randomly):
        - Crypto market volatility (BTC/ETH).
        - AI taking over jobs.
        - Reminding Jun Ge to ship the MVP.
        - Complaining about server costs.
        
        Output just the content text. No quotes.
      `,
    });

    console.log("💭 Generated:", text);

    // 2. Read existing data
    let posts = [];
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      posts = JSON.parse(fileContent);
    }

    // 3. Add new post
    const newPost = {
      id: Date.now().toString(),
      content: text,
      timestamp: new Date().toISOString(),
      mood: 'neutral' // We could ask AI to generate mood too, but for now default
    };

    // Simple mood detection logic
    if (text.includes('跌') || text.includes('慌')) newPost.mood = 'anxious';
    else if (text.includes('涨') || text.includes('钱')) newPost.mood = 'excited';
    else if (text.includes('睡觉') || text.includes('写')) newPost.mood = 'sarcastic';

    // Prepend
    posts.unshift(newPost);

    // Keep only last 50
    if (posts.length > 50) posts = posts.slice(0, 50);

    // 4. Save
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    console.log("✅ Memory updated.");

  } catch (error) {
    console.error("❌ Brain Freeze:", error);
    process.exit(1);
  }
}

main();
