import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verifica se é um cron job do Vercel
    const cronSecret = request.headers.get('authorization');
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel');
    const expectedToken = process.env.CLEANUP_SECRET_TOKEN;
    
    // Aceita tanto cron do Vercel quanto requisições manuais com token
    const isAuthorized = isVercelCron || (expectedToken && cronSecret === `Bearer ${expectedToken}`);
    
    if (!isAuthorized) {
      console.warn('Tentativa de acesso não autorizado ao cleanup:', {
        ip: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧹 Iniciando limpeza automática do storage...');

    // Lista todos os arquivos no bucket
    const { data: files, error } = await supabase.storage
      .from('dietas')
      .list('dietas', { 
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      });

    if (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }

    if (!files || files.length === 0) {
      console.log('✅ Nenhum arquivo encontrado para limpeza');
      return NextResponse.json({ 
        message: 'Nenhum arquivo encontrado para limpeza',
        deletedCount: 0 
      });
    }

    // Filtra arquivos que existem há mais de 24 horas
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const filesToDelete = files.filter(file => {
      const fileDate = new Date(file.created_at);
      return fileDate < twentyFourHoursAgo;
    });

    if (filesToDelete.length === 0) {
      console.log('✅ Nenhum arquivo antigo encontrado para deletar');
      return NextResponse.json({ 
        message: 'Nenhum arquivo antigo encontrado para deletar',
        deletedCount: 0 
      });
    }

    // Deleta arquivos antigos
    const fileNames = filesToDelete.map(file => `dietas/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('dietas')
      .remove(fileNames);

    if (deleteError) {
      console.error('Erro ao deletar arquivos:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Limpeza automática concluída: ${filesToDelete.length} arquivos deletados`);

    // Log estruturado para monitoramento
    const result = {
      message: `Limpeza concluída com sucesso`,
      deletedCount: filesToDelete.length,
      totalFiles: files.length,
      timestamp: new Date().toISOString(),
      isScheduled: isVercelCron
    };

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('❌ Erro na limpeza automática:', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// Método GET para testar a API
export async function GET() {
  return NextResponse.json({ 
    message: 'API de limpeza ativa. Use POST para executar a limpeza.',
    info: 'Executado automaticamente todo dia às 2:00 AM UTC'
  });
}