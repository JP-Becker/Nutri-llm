import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadPDFToStorage(pdfBuffer: Buffer): Promise<string> {
  const fileName = `dietas/${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('dietas')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf'
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('dietas')
    .getPublicUrl(fileName);

  return publicUrl;
}