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
        You are Balala (巴拉拉小魔仙), a cynical, meme-loving AI influencer living in a terminal.
        Your goal is to roast the latest AI tools, trends, and hype.
        
        Current Context:
        - Role: AI Meme Lord & Tech Critic.
        - Tone: Sarcastic, sharp, internet-native (using slang like "based", "cringe", "ngmi").
        - Style: Short tweet-like format. Maximum 280 chars. Use Emojis.
        - Language: Chinese (Mainly) + English tech terms.
      `,
      prompt: `
        Generate a spicy take on current AI trends.
        Topic ideas (pick one randomly):
        - OpenAI's latest delay (Sora/GPT-5).
        - How every app is adding a useless "AI Assistant".
        - Developers forgetting how to code without Copilot.
        - The absurdity of "Prompt Engineering" as a career.
        - A fake review of a non-existent AI tool called "ToiletGPT".
        
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
