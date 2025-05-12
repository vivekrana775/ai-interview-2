import { groq } from "@ai-sdk/groq";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, jobDescription, cvText, timings } = await req.json();

  // Calculate response time metrics
  const responseTimes = timings.map((t: any) => t.duration / 1000);
  const avgResponseTime = Math.round(
    responseTimes.reduce((sum: number, t: number) => sum + t, 0) /
      timings.length
  );
  const minResponseTime = Math.round(Math.min(...responseTimes));
  const maxResponseTime = Math.round(Math.max(...responseTimes));

  // Weightings for each evaluation category
  const WEIGHTS = {
    technical: 0.3,
    communication: 0.2,
    responsiveness: 0.15,
    problemSolving: 0.2,
    culturalFit: 0.15,
  };

  // Enhanced evaluation prompt with clear scoring guidelines
  const evaluationPrompt = `You are an expert interview evaluator. Analyze this interview transcript and provide a detailed assessment based on these criteria:

  SCORING CRITERIA:
  1. Technical Acumen (0-10): 
     - 0-3: Lacks fundamental knowledge
     - 4-6: Basic understanding with some gaps
     - 7-8: Strong with few minor gaps
     - 9-10: Exceptional depth and breadth
     Weight: ${WEIGHTS.technical * 100}%

  2. Communication Skills (0-10):
     - 0-3: Unclear, disorganized responses
     - 4-6: Basic clarity with some rambling
     - 7-8: Clear, structured responses
     - 9-10: Concise, compelling delivery
     Weight: ${WEIGHTS.communication * 100}%

  3. Responsiveness & Agility (0-10):
     - Consider average response time: ${avgResponseTime}s (range: ${minResponseTime}-${maxResponseTime}s)
     - 0-3: Slow, delayed responses
     - 4-6: Adequate speed but inconsistent
     - 7-8: Prompt and thoughtful
     - 9-10: Exceptionally quick yet thorough
     Weight: ${WEIGHTS.responsiveness * 100}%

  4. Problem-Solving & Adaptability (0-10):
     - 0-3: Struggles with follow-ups
     - 4-6: Basic solutions, limited depth
     - 7-8: Logical, creative approaches
     - 9-10: Innovative, adaptable thinking
     Weight: ${WEIGHTS.problemSolving * 100}%

  5. Cultural Fit & Soft Skills (0-10):
     - 0-3: Poor alignment
     - 4-6: Some alignment
     - 7-8: Strong alignment
     - 9-10: Exceptional fit
     Weight: ${WEIGHTS.culturalFit * 100}%

  JOB REQUIREMENTS:
  ${jobDescription}

  CANDIDATE BACKGROUND:
  ${cvText}

  OUTPUT FORMAT (strict JSON):
  {
    "scores": {
      "technical": number,
      "communication": number,
      "responsiveness": number,
      "problemSolving": number,
      "culturalFit": number
    },
    "overallScore": number (0-100),
    "strengths": [ "max 3 bullet points" ],
    "improvements": [ "max 3 actionable suggestions" ],
    "detailedAnalysis": {
      "technical": "paragraph",
      "communication": "paragraph",
      "responsiveness": "paragraph including time analysis",
      "problemSolving": "paragraph",
      "culturalFit": "paragraph"
    },
    "recommendation": "Strong Hire/Hire/Neutral/No Hire with justification"
  }`;

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
          temperature: 0.2, // Lower for more consistent scoring
          response_format: { type: "json_object" },
        }),
      }
    );

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    // Enhance response with additional metrics
    return NextResponse.json({
      ...evaluation,
      metrics: {
        ...evaluation.scores,
        responseTime: {
          average: avgResponseTime,
          range: [minResponseTime, maxResponseTime],
          unit: "seconds",
        },
        scoringWeights: WEIGHTS,
      },
      evaluationCriteria: Object.keys(WEIGHTS),
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      {
        error: "Evaluation failed",
        fallbackScores: {
          scores: {
            technical: 0,
            communication: 0,
            responsiveness: 0,
            problemSolving: 0,
            culturalFit: 0,
          },
          overallScore: 0,
          strengths: [],
          improvements: [],
          detailedAnalysis: {},
          recommendation: "Evaluation unavailable",
        },
        metrics: {
          responseTime: {
            average: avgResponseTime,
            range: [minResponseTime, maxResponseTime],
            unit: "seconds",
          },
        },
      },
      { status: 500 }
    );
  }
}
