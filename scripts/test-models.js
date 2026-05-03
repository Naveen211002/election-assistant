import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const m = "gemini-3-flash-preview";
  try {
    console.log(`Testing ${m}...`);
    const model = genAI.getGenerativeModel({ model: m });
    await model.generateContent("hi");
    console.log(`✅ ${m} is WORKING`);
  } catch (e) {
    console.log(`❌ ${m} FAILED: ${e.message}`);
  }
}

test();
