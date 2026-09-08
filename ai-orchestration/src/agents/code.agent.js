import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3-flash-preview", // ya "gemini-2.5-flash-lite"
  temperature: 0.7,
});

const agent = createAgent({
    model,
    tools: [ listFiles, readFiles, updateFiles ],
})

await agent.invoke({
    messages: [
        {
            role: "user",
            content: "create a simple snake game in the project using react and css."
        }
    ]
})