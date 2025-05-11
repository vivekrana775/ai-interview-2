// import * as PDFJS from "pdfjs-dist/build/pdf.min.mjs";

// export const extractTextFromPDF = async (
//   buffer: Buffer | Uint8Array
// ): Promise<string> => {
//   const loadingTask = PDFJS({
//     data: buffer instanceof Buffer ? new Uint8Array(buffer) : buffer,
//   });

//   const pdf = await loadingTask.promise;
//   let fullText = "";

//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const content = await page.getTextContent();
//     const text = content.items.map((item: any) => item.str).join(" ");
//     fullText += text + "\n";
//   }

//   return fullText.trim();
// };
