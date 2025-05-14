import { agentExecutor } from './agent'
import { HumanMessage } from '@langchain/core/messages'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Body recebido:', body) 

    if (!body.input) {
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400 }
      )
    }

    const result = await agentExecutor.invoke({
      input: body.input,
    })

    console.log('Resultado:', result)

    if (!result.output) {
      return NextResponse.json(
        { error: 'Nenhuma resposta gerada' },
        { status: 500 }
      )
    }

    return NextResponse.json({ response: result.output })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    )
  }
}