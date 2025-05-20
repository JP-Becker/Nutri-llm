import { agentExecutor } from './agent'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // console.log('Body recebido:', body)
    console.log('Mensagens recebidas:', body.messages)

    if (!body.input && !body.messages) {
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400 }
      )
    }

    if (body.input && !body.messages) {
      console.log('input recebido:', body.input)
      const result = await agentExecutor.invoke({
        messages: body.messages,
      })

      console.log('Resultado:', result)

      if (!result.output) {
        return NextResponse.json(
          { error: 'Nenhuma resposta gerada' },
          { status: 500 }
        )
      }

      return NextResponse.json({ response: result.output })
    }

    if (body.messages) {
      const lastMessage = body.messages[body.messages.length - 1]
      const previousMessages = body.messages.slice(0, -1)
      
      const result = await agentExecutor.invoke({
        input: lastMessage.content,
        chat_history: previousMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    
      if (!result.output) {
        return NextResponse.json(
          { error: 'Nenhuma resposta gerada' },
          { status: 500 }
        )
      }
    
      return NextResponse.json({ response: result.output })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    )
  }
}