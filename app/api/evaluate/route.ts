import { groq } from "@ai-sdk/groq";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, jobDescription, cvText, timings } = await req.json();

  // Calculate average response time
  const avgResponseTime = Math.round(
    timings.reduce((sum: number, t: any) => sum + t.duration, 0) /
      timings.length /
      1000
  );

  // Prepare evaluation prompt
  const evaluationPrompt = ` Analyze this interview transcript and provide:
  
    1. Technical Acumen (0-10): Assess depth of technical knowledge
    2. Communication (0-10): Clarity and structure of responses
    3. Responsiveness (0-10): Speed vs thoughtfulness (avg: ${avgResponseTime}s)
    4. Problem-Solving (0-10): Quality of follow-up answers
    5. Cultural Fit (0-10): Alignment with role requirements

    Job Description:
    ${jobDescription}

    CV:
    ${cvText}

    Return JSON with:
    - scores (object with above 5 metrics)
    - overallScore (0-100)
    - strengths (3 bullet points)
    - improvements (3 bullet points)
    - summary (paragraph)`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: evaluationPrompt,
            },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      }
    );

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      ...evaluation,
      metrics: {
        ...evaluation.scores,
        responseTime: avgResponseTime,
      },
    });
  } catch (error) {
    return NextResponse.json({
      scores: {
        technical: 7,
        communication: 7,
        responsiveness: 7,
        problemSolving: 7,
        culturalFit: 7,
      },
      overallScore: 70,
      strengths: [
        "Demonstrated relevant technical knowledge",
        "Clear communication style",
        "Good problem-solving approach",
      ],
      improvements: [
        "Could provide more specific examples",
        "Work on structuring answers more clearly",
        "Consider company culture more explicitly",
      ],
      summary: "Competent candidate with solid fundamentals...",
      metrics: {
        responseTime: avgResponseTime,
      },
    });
  }
}
