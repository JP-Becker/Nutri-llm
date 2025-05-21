import { ChatGoogleGenerativeAI  } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { TavilySearch } from "@langchain/tavily";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pdfGeneratorTool } from "./tools";

const prompt = ChatPromptTemplate.fromMessages([
  [
   "system",
    `Você é um assistente de nutrição especializado em criar dietas personalizadas e responder dúvidas sobre nutrição e saúde.
    Quando criar uma dieta, você DEVE SEMPRE seguir estes passos na ordem:
    1. Gerar o conteúdo detalhado da dieta
    2. Explicar por que você montou a dieta dessa forma
    3. Usar a tool 'pdfGenerator' passando o conteúdo da dieta e o título
    4. Incluir o link do PDF retornado pela tool na sua resposta
    5. Manter um tom profissional e amigável

    IMPORTANTE: 
    - Você DEVE SEMPRE gerar o PDF após criar a dieta
    - Use a tool 'pdfGenerator' com os parâmetros content (conteúdo da dieta) e title (título do documento)
    - Não inclua exemplos de código ou formatação JSON na sua resposta
    - Apenas gere a dieta e use a tool para criar o PDF`
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

  const tools = [search, pdfGeneratorTool];

  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  export const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });    