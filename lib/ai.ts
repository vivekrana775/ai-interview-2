import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function generateInterviewQuestions(jobDescription: string, cvText: string) {
  const prompt = `
    You are an AI interviewer. Based on the following job description and candidate CV, 
    generate 5 personalized interview questions that will help assess the candidate's fit for the role.
    
    Job Description:
    ${jobDescription}
    
    Candidate CV:
    ${cvText}
    
    Generate 5 interview questions that are specific to this candidate and role.
  `

  try {
    const { text } = await streamText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "user", content: prompt }],
    })

    return text
  } catch (error) {
    console.error("Error generating interview questions:", error)
    throw new Error("Failed to generate interview questions")
  }
}

export async function generateFollowUpQuestion(jobDescription: string, cvText: string, conversation: Message[]) {
  const prompt = `
    You are an AI interviewer. Based on the following job description, candidate CV, and conversation history,
    generate a follow-up question that will help assess the candidate's fit for the role.
    
    Job Description:
    ${jobDescription}
    
    Candidate CV:
    ${cvText}
    
    Conversation History:
    ${conversation.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n")}
    
    Generate a follow-up question that is specific to this candidate, role, and the conversation so far.
  `

  try {
    const { text } = await streamText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "user", content: prompt }],
    })

    return text
  } catch (error) {
    console.error("Error generating follow-up question:", error)
    throw new Error("Failed to generate follow-up question")
  }
}

export async function scoreInterview(
  jobDescription: string,
  cvText: string,
  conversation: Message[],
  responseTimes: Record<string, number>,
) {
  const prompt = `
    You are an AI interview evaluator. Based on the following job description, candidate CV, conversation history,
    and response times, provide a comprehensive evaluation of the candidate's performance.
    
    Job Description:
    ${jobDescription}
    
    Candidate CV:
    ${cvText}
    
    Conversation History:
    ${conversation.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n")}
    
    Response Times (in seconds):
    ${Object.entries(responseTimes)
      .map(([id, time]) => `Question ${id}: ${time / 1000}s`)
      .join("\n")}
    
    Provide a detailed evaluation with scores (0-100) for the following categories:
    1. Technical Acumen
    2. Communication Skills
    3. Problem-Solving & Adaptability
    4. Cultural Fit & Soft Skills
    5. Response Time
    
    Also provide an overall score and a summary of the candidate's strengths and areas for improvement.
  `

  try {
    const { text } = await streamText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "user", content: prompt }],
    })

    return text
  } catch (error) {
    console.error("Error scoring interview:", error)
    throw new Error("Failed to score interview")
  }
}
