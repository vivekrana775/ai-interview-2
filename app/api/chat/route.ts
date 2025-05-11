import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
  const { messages, jobDescription, cvText } = await req.json();

  // System message setup
  if (messages.length === 0) {
    const systemMessage = {
      role: "system" as const,
      content: `
        You are a professional interviewer conducting a job interview. 
        Your task is to assess the candidate's suitability for the role.

        Job Description:
        ${jobDescription || "Not provided"}

        Candidate CV:
        ${cvText || "Not provided"}

        Guidelines:
        1. Start by introducing yourself and asking the first question
        2. Ask one question at a time
        3. Ask follow-up questions based on responses
        4. After 5-7 questions, conclude the interview
        5. Be professional but friendly
        6. Focus on both technical and soft skills

        First question should be: "Can you walk me through your relevant experience for this role?"
      `,
    };
    messages.unshift(systemMessage);
  }

  // Evaluation request
  const isEvaluationRequest = messages.some((m: any) =>
    m.content.includes("evaluate my interview performance")
  );

  if (isEvaluationRequest) {
    const evaluationPrompt = {
      role: "user" as const,
      content: `
        Analyze the interview responses and provide:
        1. Score (1-10) based on relevance, depth, and clarity
        2. Detailed feedback
        3. 3 key strengths
        4. 3 areas for improvement
        
        Format as JSON with these fields:
        {
          "score": number,
          "feedback": string,
          "strengths": string[],
          "areasForImprovement": string[]
        }
      `,
    };

    const evaluation = await streamText({
      model: groq("llama3-70b-8192"),
      messages: [...messages, evaluationPrompt],
      temperature: 0.3, // More deterministic for evaluation
      maxTokens: 1000,
    });

    const evaluationText = await evaluation.text;
    try {
      const evaluationData = JSON.parse(evaluationText);
      return NextResponse.json(evaluationData);
    } catch {
      return NextResponse.json({
        score: 7,
        feedback: "Good overall performance with room for improvement",
        strengths: ["Technical knowledge", "Communication", "Experience"],
        areasForImprovement: [
          "More specific examples needed",
          "Could demonstrate more leadership",
          "Could better align with company values",
        ],
      });
    }
  }

  // Normal interview flow
  const result = await streamText({
    model: groq("llama3-70b-8192"),
    messages,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
}
