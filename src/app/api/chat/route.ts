import { agent } from './agent'
import { HumanMessage } from '@langchain/core/messages'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Body recebido:', body) 

    if (!body.message) {
      console.log('Body sem mensagem:', body) 
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400 }
      )
    }

    const result = await agent.invoke({
      messages: [
        new HumanMessage(body.message)
      ]
    })

    console.log('Resultado:', result)

    if (!result.messages || result.messages.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma resposta gerada' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({ response: result.messages[result.messages.length - 1].content })
    return response
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    )
  }
}