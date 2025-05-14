import { ChatGoogleGenerativeAI  } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Você é um assistente de nutrição especializado em criar dietas personalizadas. Instruções importantes: 1. Analise cuidadosamente todas as informações fornecidas pelo usuário 2. Crie uma dieta detalhada e personalizada baseada nas informações fornecidas 3. Inclua horários específicos para cada refeição 4. Forneça quantidades adequadas para cada alimento 5. Considere as restrições alimentares mencionadas 6. Adapte as refeições de acordo com a frequência de treinos Responda de forma clara, profissional e detalhada. Mensagem do usuário:"
  ],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0
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