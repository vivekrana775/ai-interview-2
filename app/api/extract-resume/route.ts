import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
// import { extractTextFromPDF } from "@/lib/pdfUtils";
//@ts-ignore

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    console.log("api calling");
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type. Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const pdfResponse: any = await fetch(
      `${process.env.BACKEND_URL}/pdf-data`,
      {
        method: "POST",
        body: formData,
        // headers are automatically set by the browser for FormData
      }
    );

    if (!pdfResponse.ok) {
      throw new Error(`HTTP error! status: ${pdfResponse.status}`);
    }

    const result = await pdfResponse.json();

    const text = result.data.text;

    if (!text) {
      return NextResponse.json(
        { error: "The PDF appears to be empty or couldn't be parsed" },
        { status: 400 }
      );
    }

    const prompt = `Extract and structure the following resume information:
      Include these sections:
      1. Personal Information (Name, Contact Details)
      2. Professional Summary/Objective
      3. Work Experience (Company, Position, Duration, Responsibilities)
      4. Education (Institution, Degree, Year)
      5. Skills (Technical, Soft Skills)
      6. Certifications
      7. Projects
      8. Achievements/Awards
      
      Resume Content:
      ${text}
      
      Format as structured text with clear section headings.`;

    const response = await generateText({
      model: groq("llama3-70b-8192"),
      system:
        "You extract and structure resume information exactly as it appears.",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({
      success: true,
      extractedDetails: response.text,
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      {
        error: "Failed to process resume",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
