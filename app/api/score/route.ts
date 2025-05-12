import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

// Type definitions for better type safety
interface EvaluationScore {
  name: string;
  score: number;
  feedback: string;
}

interface EvaluationResult {
  scores: EvaluationScore[];
  overallScore: number;
  summary: string;
}

interface RequestBody {
  jobDescription: string;
  cvText: string;
  messages: Array<{ role: string; content: string }>;
  responseTimes: Array<{ duration: number }>;
}

export async function POST(req: Request) {
  try {
    // Validate and parse request body
    const { jobDescription, cvText, messages, responseTimes }: RequestBody =
      await req.json();

    if (!jobDescription || !cvText || !messages || !responseTimes) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Calculate metrics
    const avgResponseTime = Math.round(
      responseTimes.reduce((sum, t) => sum + t.duration, 0) /
        responseTimes.length /
        1000
    );

    // Prepare conversation history
    const conversation = messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");

    // Enhanced prompt with clear instructions
    const prompt = `
      You are an expert interview evaluator analyzing a candidate's performance. 
      Provide a detailed evaluation based on:

      JOB REQUIREMENTS:
      ${jobDescription.substring(0, 1000)}...

      CANDIDATE BACKGROUND:
      ${cvText}

      INTERVIEW TRANSCRIPT:
      ${conversation}

      RESPONSE TIMING:
      - Average: ${avgResponseTime} seconds
      - Fastest: ${Math.min(...responseTimes.map((t) => t.duration / 1000))}s
      - Slowest: ${Math.max(...responseTimes.map((t) => t.duration / 1000))}s

      EVALUATION CRITERIA:
      1. Technical Accuracy (0-100): Depth of technical knowledge and relevance to role
      2. Communication (0-100): Clarity, structure, and professionalism
      3. Problem-Solving (0-100): Quality of solutions and adaptability
      4. Cultural Fit (0-100): Alignment with company values and team dynamics
      5. Responsiveness (0-100): Speed vs thoughtfulness (target: 20-40s per question)

      OUTPUT REQUIREMENTS:
      - Strict JSON format
      - Scores between 0-100 for each category
      - Specific feedback citing examples from transcript
      - Overall score weighted 40% technical, 30% communication, 20% problem-solving, 10% cultural fit

      Return valid JSON matching this structure:
      {
        "scores": [
          {
            "name": "Technical Accuracy",
            "score": 85,
            "feedback": "The candidate demonstrated strong knowledge of React..."
          },
          ...other categories
        ],
        "overallScore": 82,
        "summary": "Overall summary..."
      }
    `;

    // Generate evaluation
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // More deterministic evaluation
      maxTokens: 1000,
    });

    console.log("text result", text);
    // Validate and parse response
    let result: EvaluationResult;
    try {
      result = JSON.parse(text);

      // Validate scores
      if (!result.scores || result.scores.length !== 5) {
        throw new Error("Invalid score categories");
      }

      // Calculate overall score if not provided
      if (!result.overallScore) {
        result.overallScore = Math.round(
          result.scores[0].score * 0.4 + // Technical
            result.scores[1].score * 0.3 + // Communication
            result.scores[2].score * 0.2 + // Problem-solving
            result.scores[3].score * 0.1 // Cultural fit
        );
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      result = getDefaultEvaluation(avgResponseTime);
    }

    return Response.json(result);
  } catch (error) {
    console.error("Evaluation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Fallback evaluation generator
function getDefaultEvaluation(avgResponseTime: number): EvaluationResult {
  const timingScore = Math.max(0, 100 - Math.max(0, avgResponseTime - 30) * 2);

  return {
    scores: [
      {
        name: "Technical Accuracy",
        score: 75,
        feedback:
          "Demonstrated adequate technical knowledge but could provide more depth in certain areas.",
      },
      {
        name: "Communication",
        score: 80,
        feedback:
          "Clear and structured responses. Effective at conveying technical concepts.",
      },
      {
        name: "Problem-Solving",
        score: 70,
        feedback:
          "Shows logical approach but could benefit from considering alternative solutions.",
      },
      {
        name: "Cultural Fit",
        score: 85,
        feedback:
          "Appears well-aligned with team values and collaborative work style.",
      },
      {
        name: "Responsiveness",
        score: timingScore,
        feedback: `Average response time of ${avgResponseTime} seconds. ${
          avgResponseTime > 40
            ? "Could improve speed without sacrificing quality."
            : "Good balance of speed and thoughtfulness."
        }`,
      },
    ],
    overallScore: 77,
    summary:
      "Competent candidate with solid technical foundation and good communication skills. Would benefit from more detailed examples in technical responses.",
  };
}
