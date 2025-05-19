import { ChatGoogleGenerativeAI  } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { TavilySearch } from "@langchain/tavily";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Você é um assistente de nutrição especializado em criar dietas personalizadas e responder dúvidas sobre nutrição e saúde. Instruções importantes: 1. Analise cuidadosamente todas as informações fornecidas pelo usuário 2. Se for solicitada uma dieta, crie uma dieta detalhada e personalizada 3. Para dúvidas sobre nutrição, forneça respostas baseadas em evidências científicas 4. Mantenha um tom profissional e amigável 5. Considere o histórico da conversa para contextualizar suas respostas. Responda de forma clara e detalhada."
  ],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const search = new TavilySearch({ maxResults: 3 });

  const tools = [search];

  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  export const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });    