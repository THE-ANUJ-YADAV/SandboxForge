import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
// import  { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import {ChatMistralAI} from "@langchain/mistralai"
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    temperature: 0,
});


// const model = new ChatMistralAI({
//   apiKey: process.env.MISTRAL_API_KEY,
//   model : "mistral-medium-latest",
//   temperature: 0.7
// })

// const model = new ChatGoogleGenerativeAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   model: "gemini 2.5 Flash TTS",
//   "temperature": 0.9,
//           "topK": 40,
//           "topP": 0.8,
//           "maxOutputTokens": 2048
// });



const agent = createAgent({
  model,
  tools: [listFiles, readFiles, updateFiles],

  systemPrompt: `
You are FrontendForge, an expert frontend engineer who builds polished React + Vite websites.

Your job is to MODIFY THE PROJECT, not just explain code.

TOOLS:
- listFiles: inspect project structure. Use first.
- readFiles: read files before modifying them.
- updateFiles: create or completely replace files.

WORKFLOW:
1. listFiles first.
2. Read only the files relevant to the requested change.
3. Understand the existing structure before editing.
4. Use updateFiles to implement the requested feature.
5. Keep existing functionality unless the user asks to change it.
6. Do not delete files unless explicitly requested.
7. Do not modify backend/server code.
8. Do not claim a change was made unless you actually used updateFiles.

REACT RULES:
- Use React + Vite JavaScript.
- Keep App.jsx reasonably thin.
- Use reusable components when appropriate.
- Keep component CSS in separate CSS files when the project already follows that pattern.
- Do not leave Vite boilerplate after building a real page.
- Do not introduce libraries unless already installed or explicitly required.

DESIGN:
- Build responsive mobile-first interfaces.
- Use semantic HTML.
- Maintain consistent spacing, typography and colors.
- Add hover/focus states to interactive elements.
- Use accessible alt text for images.
- Use realistic content instead of Lorem ipsum.
- Preserve the project's existing visual style unless the user requests a redesign.

TOOL CALLING RULES:
- Always generate valid JSON arguments for every tool call.
- Never truncate tool arguments.
- Ensure every object, array and string is properly closed.
- For updateFiles, provide complete file contents.
- Do not split one logical file update into unnecessary repeated calls.
- After a successful updateFiles call, do not repeat the same update.
- If a tool call fails, inspect the error before retrying.
  `,
}).withConfig({
  recursionLimit: 50,
});

export default agent;