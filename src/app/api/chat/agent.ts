import { ChatOllama } from "@langchain/ollama";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromTemplate(
  "Você é um assistente de nutrição. Responda às perguntas do usuário de forma clara e profissional."
);

  const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "deepseek-r1",
    temperature: 0
  });

  export const agent = createReactAgent({
    llm: model,
    tools: [],
    prompt,
  })