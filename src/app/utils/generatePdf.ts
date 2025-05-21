import { jsPDF } from 'jspdf';

    export async function createPDF(content: string, title: string): Promise<Buffer> {
        try {
          const doc = new jsPDF();

          doc.setFontSize(16);
          doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

          doc.setFontSize(12);
          
          // Quebrar o conteúdo em linhas para caber na página
          const splitText = doc.splitTextToSize(
            content, 
            doc.internal.pageSize.getWidth() - 20
          );
          
          // Adicionar o conteúdo começando após o título
          doc.text(splitText, 10, 40);
          
          // Converter para Buffer
          const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
          
          return pdfBuffer;
        } catch (error) {
          console.error('Erro ao gerar PDF:', error);
          throw error;
        }
      }