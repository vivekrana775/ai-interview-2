import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  const { jobDescription, cvText } = await req.json()

  if (!jobDescription || !cvText) {
    return Response.json({ error: "Job description and CV are required" }, { status: 400 })
  }

  const prompt = `
    You are an AI interviewer. Based on the following job description and candidate CV, 
    generate 5 personalized interview questions that will help assess the candidate's fit for the role.
    
    Job Description:
    ${jobDescription}
    
    Candidate CV:
    ${cvText}
    
    Generate 5 interview questions that are specific to this candidate and role.
    Format the output as a JSON array of strings.
  `

  try {
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "user", content: prompt }],
    })

    // Try to parse the response as JSON
    try {
      const questions = JSON.parse(text)
      return Response.json({ questions })
    } catch (parseError) {
      // If parsing fails, extract questions manually
      const questionLines = text
        .split("\n")
        .filter(
          (line) =>
            line.trim().match(/^\d+[.)]\s+.+/) || line.trim().match(/^".+"$/) || line.trim().match(/^Question \d+:/),
        )

      const extractedQuestions = questionLines.map((line) => {
        // Remove numbers, quotes, etc.
        return line
          .replace(/^\d+[.)]\s+/, "")
          .replace(/^Question \d+:\s*/, "")
          .replace(/^"(.+)"$/, "$1")
          .trim()
      })

      return Response.json({
        questions:
          extractedQuestions.length >= 3
            ? extractedQuestions
            : [
                "Could you tell me about your relevant experience for this role?",
                "How do your skills align with the requirements in the job description?",
                "Can you describe a challenging project you've worked on?",
                "What interests you most about this position?",
                "How do you stay updated with the latest trends in your field?",
              ],
      })
    }
  } catch (error) {
    console.error("Error generating interview questions:", error)
    return Response.json({ error: "Failed to generate interview questions" }, { status: 500 })
  }
}
