import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const openaiApiKey = process.env.OPENAI_API_KEY;
const minimaxApiKey = process.env.MINIMAX_API_KEY;

let openai: ReturnType<typeof createOpenAI>;
let minimax: ReturnType<typeof createOpenAICompatible>;

if (openaiApiKey && minimaxApiKey) {
    openai = createOpenAI({
        apiKey: openaiApiKey,
    });

    minimax = createOpenAICompatible({
        name: "minimax",
        baseURL: "https://api.minimax.io/v1",
        apiKey: minimaxApiKey,
    });
} else {
    console.warn("Missing API keys - agents will not function. Set OPENAI_API_KEY and MINIMAX_API_KEY.");
    openai = createOpenAI({ apiKey: "dummy-key-for-build" });
    minimax = createOpenAICompatible({ name: "minimax", baseURL: "https://api.minimax.io/v1", apiKey: "dummy-key-for-build" });
}

export { openai, minimax };
