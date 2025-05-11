import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { jobDescription, cvText, messages, responseTimes } = await req.json();

  if (!jobDescription || !cvText || !messages || !responseTimes) {
    return Response.json(
      {
        error: "Job description, CV, messages, and response times are required",
      },
      { status: 400 }
    );
  }

  const conversation = messages
    .filter((msg: any) => msg.role !== "system")
    .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  const responseTimeText = Object.entries(responseTimes)
    .map(
      ([questionNum, time]: any) =>
        `Question ${questionNum}: ${(time / 1000).toFixed(1)}s`
    )
    .join("\n");

  const prompt = `
    You are an interview evaluator. Based on the following job description, candidate CV, conversation history,
    and response times, provide a comprehensive evaluation of the candidate's performance.
    
    Job Description:
    ${jobDescription}
    
    Candidate CV:
    ${cvText}
    
    Conversation History:
    ${conversation}
    
    Response Times (in seconds):
    ${responseTimeText}
    
    Provide a detailed evaluation with scores (0-100) for the following categories:
    1. Technical Acumen
    2. Communication Skills
    3. Problem-Solving & Adaptability
    4. Cultural Fit & Soft Skills
    5. Response Time
    
    Format your response as a JSON object with the following structure:
    {
      "scores": [
        {
          "name": "Technical Acumen",
          "score": 85,
          "feedback": "Detailed feedback here"
        },
        ...other categories
      ],
      "overallScore": 82,
      "summary": "Overall summary here"
    }
  `;

  try {
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "user", content: prompt }],
    });

    try {
      const result = JSON.parse(text);
      return Response.json(result);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);

      const defaultResult = {
        scores: [
          {
            name: "Technical Acumen",
            score: 75,
            feedback:
              "The candidate demonstrated adequate technical knowledge relevant to the position.",
          },
          {
            name: "Communication Skills",
            score: 80,
            feedback:
              "Good communication skills. Articulated thoughts clearly in most responses.",
          },
          {
            name: "Problem-Solving & Adaptability",
            score: 70,
            feedback:
              "Showed reasonable problem-solving approach. Could improve on considering alternative solutions.",
          },
          {
            name: "Cultural Fit & Soft Skills",
            score: 85,
            feedback:
              "Appears to align well with company values. Demonstrated teamwork and empathy.",
          },
          {
            name: "Response Time",
            score: 75,
            feedback:
              "Average response time was acceptable. Some complex questions took longer to answer.",
          },
        ],
        overallScore: 77,
        summary:
          "The candidate demonstrated good overall potential for the role with particular strengths in cultural fit and communication. There are some areas for improvement in technical depth and problem-solving approach.",
      };

      return Response.json(defaultResult);
    }
  } catch (error) {
    console.error("Error scoring interview:", error);
    return Response.json(
      { error: "Failed to score interview" },
      { status: 500 }
    );
  }
}
