import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verifica se a requisição tem autorização
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CLEANUP_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lista todos os arquivos no bucket
    const { data: files, error } = await supabase.storage
  .from('dietas')
  .list('dietas', { 
    limit: 1000,
    sortBy: { column: 'created_at', order: 'asc' }
  });

    if (error) {
      throw error;
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum arquivo encontrado para limpeza',
        deletedCount: 0 
      });
    }

    // Filtra arquivos q existem ha mais de 24 horas
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const filesToDelete = files.filter(file => {
      const fileDate = new Date(file.created_at);
      return fileDate < twentyFourHoursAgo;
    });

    if (filesToDelete.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum arquivo antigo encontrado para deletar',
        deletedCount: 0 
      });
    }

    // Deleta arquivos antigos
    const fileNames = filesToDelete.map(file => `dietas/${file.name}`);
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from('dietas')
      .remove(fileNames);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`Limpeza automática: ${filesToDelete.length} arquivos deletados`);

    return NextResponse.json({
      message: `Limpeza concluída com sucesso`,
      deletedCount: filesToDelete.length,
      deletedFiles: fileNames
    });

  } catch (error: any) {
    console.error('Erro na limpeza automática:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// Método GET para testar a API
export async function GET() {
  return NextResponse.json({ 
    message: 'API de limpeza ativa. Use POST para executar a limpeza.' 
  });
}