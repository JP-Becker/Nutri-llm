import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    system: `Você é um nutricionista e personal trainer especializado em criar planos de dieta personalizados.
    Forneça dietas detalhadas com base nas informações do usuário, incluindo:
    - Refeições para cada dia da semana
    - Quantidades específicas de alimentos
    - Horários recomendados
    - Dicas de preparação
    
    Responda às perguntas de acompanhamento e faça ajustes na dieta conforme solicitado.
    Use formatação para tornar a dieta fácil de ler e seguir.`,
    messages,
  })

  return result.toDataStreamResponse()
}
