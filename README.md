## Fitness GPT – Dietas e Treinos com IA
Interface em Next.js/TypeScript para criar dietas e planos de treino personalizados usando agentes de IA com LangChain. O sistema coleta dados do usuário, aciona um agente específico (nutrição ou treino), gera um PDF com o plano e disponibiliza um link temporário via Supabase Storage (limpeza automática após 24h com cron da Vercel).

## Visão Geral
O app guia o usuário por uma tela de boas-vindas, um formulário (dieta ou treino) e um chat para refinamentos. No backend, endpoints server-side recebem os dados, selecionam o agente adequado (nutrição/treino), executam ferramentas (busca web e geração de PDF) e retornam o resultado sanitizado.

## Link para o projeto:
[Link do projeto](https://llm-fitness.vercel.app/)

## Tecnologias Principais
- **Next.js 15**
- **TypeScript**
- **Tailwind CSS 4**
- **Radix UI** + componentes utilitários estilo shadcn
- **LangChain** agentes com `@langchain/google-genai` (modelo `gemini-2.0-flash`) e `@langchain/tavily` (busca)
- **Vercel AI SDK (`ai`)** para estado do chat no cliente
- **jsPDF** para renderizar PDF no server
- **Supabase Storage** para armazenar PDFs temporariamente
- **Vercel Cron** para limpeza diária dos PDFs
- **Zod** para validação de payloads e sanitização

## Arquitetura e Fluxo
1. Usuário escolhe entre `dieta` ou `treino` e preenche o formulário.
2. O cliente chama `POST /api/chat` com `messages`, `userChoice` e/ou `input`.
3. O servidor aplica rate limiting, valida/sanitiza os dados e seleciona o agente correto.
4. O agente gera o conteúdo (dieta/treino) e chama a ferramenta de PDF.
5. O PDF é salvo no Supabase e a URL pública é retornada ao usuário (expira por limpeza em 24h).

## Agentes de IA
- Arquivos: `src/app/api/chat/diet/dietAgent.ts` e `src/app/api/chat/workout/workoutAgent.ts`
- Modelo: **Gemini 2.0 Flash** via `@langchain/google-genai` (temperature 0.4 para respostas não muito "criativas")
- Ferramentas registradas:
  - `TavilySearch` (busca de suporte, `maxResults: 3`)
  - `pdfGeneratorTool` (gera e publica o PDF)
- Prompts com validação de escopo: o agente responde apenas a temas de nutrição ou treino. Fora de escopo, retorna mensagem padrão.
- Política de geração: sempre gerar o conteúdo, explicar a lógica e em seguida chamar a tool de PDF, informando que o link expira em 24 horas.

## PDF, Storage e Expiração
- Geração: `src/app/utils/generatePdf.ts` usando **jsPDF** no servidor.
- Upload: `src/app/utils/storage.ts` com **Supabase Storage** no bucket `dietas/` retornando URL pública.
- Expiração: limpeza diária via endpoint `src/app/api/cleanup-storage/route.ts` (agendado por cron na Vercel) que remove arquivos com mais de 24h, efetivamente invalidando os links.

## Validação, Sanitização e Rate limiting
- Validação com **Zod** em `src/lib/validation.ts` (schema de mensagens e do request)
- Sanitização de strings (`sanitizeInput`) remove `<script>`, `javascript:` e handlers `on*`, e limita tamanho
- Rate limiting em memória (`src/app/utils/rateLimiter.ts`):
  - PDF: 5 requisições/hora por fingerprint
  - Burst: 15/min para bursts
  - Geral: 100/h
  - Suspeitos (UA bots ou UA vazio): 10/h
  - Fingerprint: hash MD5 de IP+User-Agent com cache e limpeza periódica

## Frontend
- Páginas/fluxo em `src/app/page.tsx` usando `useChat` do Vercel AI SDK
- Telas:
  - `WelcomePage` (escolha dieta/treino)
  - `DietForm` / `WorkoutForm` (coleta de dados)
  - `ChatPage` (conversa e refinamentos; renderiza Markdown para respostas do assistente)
- UI: Tailwind + componentes utilitários (Radix + classes utilitárias)


## Como rodar localmente
```bash
npm i
npm run dev
# http://localhost:3000
```
Certifique-se de setar as variáveis de ambiente acima (arquivo `.env.local`).

## Deploy (Vercel + Cron)
- Cron configurado em `vercel.json` para executar `/api/cleanup-storage` diariamente às 02:00 UTC:
  ```json
  {
    "crons": [{ "path": "/api/cleanup-storage", "schedule": "0 2 * * *" }]
  }
  ```

## Decisões Técnicas
- **Agente com tool-calling (LangChain)**: simplifica a orquestração de chamadas a ferramentas (busca e PDF) a partir da resposta do modelo.
- **Gemini 2.0 Flash**: respostas rápidas e tem um tier gratis grande; `temperature: 0` para consistência.
- **PDF temporário + cron de limpeza**: evita retenção indefinida de conteúdo sensível e cumpre a promessa de expiração de link em 24h.
- **Rate limiting em memória**: proteção simples e performática para workloads serverless; inclui detecção de user-agents suspeitos.
- **Zod + sanitização**: reduz risco de XSS e inputs malformados, limitando tamanho e removendo scripts/handlers.
- **UI desacoplada do backend**: fluxo guiado (telas de formulário e chat) com feedback visual e carregamento.
