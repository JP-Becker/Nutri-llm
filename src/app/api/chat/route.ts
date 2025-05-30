import { NextResponse } from 'next/server';
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { agentExecutorDiet } from './diet/dietAgent';
import { agentExecutorWorkout } from './workout/workoutAgent';
import { checkRateLimit, createClientFingerprint } from '@/app/utils/rateLimiter';
import { chatRequestSchema, sanitizeInput } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const clientFingerprint = createClientFingerprint(req);
    
    // Verifica rate limit
    const rateLimitResult = checkRateLimit(clientFingerprint, 50, 3600000);
    
    if (!rateLimitResult) {
      return NextResponse.json(
        { 
          error: 'Limite de criação de PDFs atingido. Você pode gerar no máximo 5 PDFs por hora. Tente novamente mais tarde.',
          rateLimitExceeded: true
        }, 
        { status: 429 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.warn('Erro ao fazer parse do JSON:', parseError);
      return NextResponse.json(
        { error: 'Formato JSON inválido' },
        { status: 400 }
      );
    }
    // const body = await req.json();

    const validationResult = chatRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.warn('Validação falhou:', {
        fingerprint: clientFingerprint,
        errors: validationResult.error.errors,
        receivedData: body
      });
      
      return NextResponse.json(
        { 
          error: 'Dados inválidos fornecidos',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, 
        { status: 400 }
      );
    }
    const { messages, userChoice, input: directInput } = validationResult.data;
    
    // const { messages, userChoice, input: directInput } = body;

    let agentToUse;
    let agentInputContent = directInput; 

    if (!agentInputContent && messages && messages.length > 0) {
      agentInputContent = messages[messages.length - 1].content;
    }
    
    if (!agentInputContent) {
      return NextResponse.json({ error: 'Conteúdo da mensagem não fornecido.' }, { status: 400 });
    }

    // Seleciona o agente com base no userChoice
    if (userChoice === 'diet') {
      agentToUse = agentExecutorDiet;
    } else if (userChoice === 'workout') {
      agentToUse = agentExecutorWorkout;
    } else {
      console.warn(`UserChoice não especificado ou inválido: ${userChoice}`);

      return NextResponse.json(
        { error: 'Tipo de assistência (dieta/treino) não especificado corretamente.' },
        { status: 400 }
      );
    }

    let chatHistoryForAgent: (HumanMessage | AIMessage)[] = [];
    if (messages && messages.length > 0) {
        // Se directInput foi usado, 'messages' é o histórico. Se não, 'messages' contém o histórico + input atual.
        const historySource = directInput ? messages : messages.slice(0, -1);
        chatHistoryForAgent = historySource.map((msg: { role: string; content: any }) => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else if (msg.role === 'assistant') {
          return new AIMessage(msg.content);
        }
        // Lidar com outros papéis ou retornar um tipo padrão
        return new HumanMessage(msg.content); 
      });
    }
    

    const result = await agentToUse.invoke({
      input: agentInputContent,
      chat_history: chatHistoryForAgent,
    });

    if (!result || typeof result.output === 'undefined') {
      console.error('Resposta inesperada do agente:', result);
      return NextResponse.json({ error: 'Nenhuma resposta gerada ou formato inválido.' }, { status: 500 });
    }

    if (typeof result.output !== 'string') {
      console.error('Tipo de resposta inválido do agente:', typeof result.output);
      return NextResponse.json(
        { error: 'Formato de resposta inválido.' }, 
        { status: 500 }
      );
    }

    const sanitizedResponse = sanitizeInput(result.output);

    return NextResponse.json({ response: sanitizedResponse });

  } catch (error: any) {
    console.error('Erro na API /api/chat:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição', details: error.message },
      { status: 500 }
    );
  }
}