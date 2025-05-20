import { z } from "zod";
import { tool } from "@langchain/core/tools";

const adderSchema = z.object({
  a: z.number(),
  b: z.number(),
});
const adderTool = tool(
  async (input): Promise<string> => {
    const sum = input.a + input.b;
    return `The sum of ${input.a} and ${input.b} is ${sum}`;
  },
  {
    name: "pdfGenerator",
    description: "gera um pdf com a dieta",
    schema: adderSchema,
  }
);

await adderTool.invoke({ a: 1, b: 2 });