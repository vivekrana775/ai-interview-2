import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages, jobDescription, cvText } = await req.json();

  // If this is the first message, add context about the job and CV
  let updatedMessages = [...messages];

  // Create a system message with context from the job description and CV
  if (
    messages.length === 0 ||
    !messages.some((msg: any) => msg.role === "system")
  ) {
    const systemMessage = {
      role: "system",
      content: `
        You are an interviewer conducting a job interview. 
        
        Job Description:
        ${jobDescription || "Not provided"}
        
        Candidate CV:
        ${cvText || "Not provided"}
        
        Your task is to ask relevant questions based on the job description and CV,
        and follow up with appropriate questions based on the candidate's responses.
        Be professional, conversational, and insightful in your questioning.
        
        Follow these guidelines:
        1. Ask one question at a time and wait for the candidate's response before asking the next question.
        2. Focus on questions that assess both technical skills and soft skills relevant to the position.
        3. Adapt your questions based on the candidate's previous answers.
        4. Ask follow-up questions when you need clarification or more details.
        5. Be respectful and professional at all times.
        6. After 5-7 questions, conclude the interview and thank the candidate.
        
        Start by introducing yourself as an interviewer and ask your first question.
      `,
    };

    // Add the system message to the beginning of the messages array
    updatedMessages = [systemMessage, ...messages];
  }

  const result = streamText({
    model: groq("llama3-70b-8192"),
    messages: updatedMessages,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
}
