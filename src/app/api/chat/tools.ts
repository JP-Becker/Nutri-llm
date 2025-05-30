import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { createPDF } from "@/app/utils/generatePdf";
import { uploadPDFToStorage } from "@/app/utils/storage";

const pdfGeneratorSchema = z.object({
  content: z.string().describe("Conteúdo completo da dieta"),
  title: z.string().describe("Título do documento PDF")
});

export const pdfGeneratorTool = tool(
  async (input): Promise<string> => {
    try {
      console.log("Gerando PDF com:", input);

      const pdfBuffer = await createPDF(
        input.content,
        input.title
      );

      const pdfUrl = await uploadPDFToStorage(pdfBuffer);

      return `PDF gerado com sucesso! Você pode acessar sua dieta em PDF através deste link: ${pdfUrl}`;
    } catch (error: unknown) {
      console.error("Erro ao gerar PDF:", error);
      return `Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    }
  },
  {
    name: "pdfGenerator",
    description: "Gera um PDF formatado com a dieta personalizada. Deve ser chamado sempre após gerar uma dieta.",
    schema: pdfGeneratorSchema,
  }
);