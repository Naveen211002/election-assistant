import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  console.log("Listing all available models for your key...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    if (data.models) {
      data.models.forEach(m => {
        console.log(`- ${m.name} (${m.displayName})`);
      });
    } else {
      console.log("No models found or error:", JSON.stringify(data));
    }
  } catch (e) {
    console.log("Fetch error:", e.message);
  }
}

listModels();
