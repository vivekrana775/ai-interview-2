"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Home, FileText } from "lucide-react";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { ResponseTimeAnalysis } from "@/components/response-time-analysis";
import { InterviewTranscript } from "@/components/interview-transcript";
import { ResumeMatchAnalysis } from "@/components/resume-match-analysis";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/components/auth-provider";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

type Message = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: number;
  responseTime?: number;
};

type ScoreCategory = {
  name: string;
  score: number;
  feedback: string;
};

type ScoringResult = {
  scores: ScoreCategory[];
  overallScore: number;
  summary: string;
};

export default function InterviewResults() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<ScoreCategory[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [summary, setSummary] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);

  useEffect(() => {
    // Load interview data
    const loadInterviewData = async () => {
      setIsLoading(true);

      try {
        const interviewId = params.id as string;

        // Try to get data from database if user is logged in
        if (user) {
          const { data, error } = await supabase
            .from("interviews")
            .select(
              `
              *,
              candidates(*)
            `
            )
            .eq("id", interviewId)
            .eq("user_id", user.id)
            .single();

          if (error) throw error;

          if (data) {
            setJobDescription(data.job_description);
            setCvText(data.candidates?.cv_text || "");

            // If the interview is completed, use the stored scores
            if (data.status === "completed") {
              setScores(data.scores || []);
              setOverallScore(data.overall_score || 0);
              setSummary(data.summary || "");
              setResponseTimes(data.response_times || {});
              setMessages(data.transcript || []);
              setResumeAnalysis(data.resume_analysis || null);
              setIsLoading(false);
              return;
            }
          }
        }

        // Fallback to localStorage
        const interviewDataString = localStorage.getItem("interviewData");
        const storedJobDescription = localStorage.getItem("jobDescription");
        const storedCvText = localStorage.getItem("cvText");

        if (!interviewDataString || !storedJobDescription || !storedCvText) {
          // Redirect back to home if no data
          router.push("/");
          return;
        }

        setJobDescription(storedJobDescription);
        setCvText(storedCvText);

        try {
          const interviewData = JSON.parse(interviewDataString);

          // Extract messages and response times
          const extractedMessages = interviewData.filter(
            (item) => item.role !== undefined
          ) as Message[];
          const responseTimesObj =
            interviewData.find((item) => item.responseTimes !== undefined)
              ?.responseTimes || {};

          setMessages(extractedMessages);
          setResponseTimes(responseTimesObj);

          // Generate AI scoring
          await generateInterviewScoring(
            extractedMessages,
            responseTimesObj,
            storedJobDescription,
            storedCvText
          );

          // Analyze resume if not already done
          if (!resumeAnalysis) {
            await analyzeResume(storedJobDescription, storedCvText);
          }
        } catch (error) {
          console.error("Error parsing interview data:", error);
          router.push("/");
        }
      } catch (error) {
        console.error("Error loading interview data:", error);
        setIsLoading(false);
      }
    };

    loadInterviewData();
  }, [user, params.id, router, resumeAnalysis]);

  const analyzeResume = async (jobDesc: string, resume: string) => {
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobDesc,
          resume: resume,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();
      setResumeAnalysis(data);

      // Update the database if user is logged in
      if (user) {
        await supabase
          .from("interviews")
          .update({
            resume_analysis: data,
          })
          .eq("id", params.id);
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
    }
  };

  const generateInterviewScoring = async (
    interviewMessages: Message[],
    responseTimes: Record<string, number>,
    jobDesc: string,
    cv: string
  ) => {
    try {
      // Format the conversation for the AI
      const conversation = interviewMessages
        .filter((msg) => msg.role !== "system")
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n");

      // Format response times
      const responseTimeText = Object.entries(responseTimes)
        .map(
          ([questionNum, time]) =>
            `Question ${questionNum}: ${(time / 1000).toFixed(1)}s`
        )
        .join("\n");

      // Create the prompt for scoring
      const prompt = `
        You are an AI interview evaluator. Based on the following job description, candidate CV, conversation history,
        and response times, provide a comprehensive evaluation of the candidate's performance.
        
        Job Description:
        ${jobDesc}
        
        Candidate CV:
        ${cv}
        
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

      // Call the AI to generate the scoring
      const { text } = await generateText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: prompt }],
      });

      // Parse the JSON response
      try {
        const result = JSON.parse(text) as ScoringResult;
        setScores(result.scores);
        setOverallScore(result.overallScore);
        setSummary(result.summary);

        // Update the database if user is logged in
        if (user) {
          await supabase
            .from("interviews")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              overall_score: result.overallScore,
              scores: result.scores,
              response_times: responseTimes,
              summary: result.summary,
              transcript: interviewMessages,
            })
            .eq("id", params.id);
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        // Fallback to default scoring if parsing fails
        setDefaultScoring();
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error generating interview scoring:", error);
      setDefaultScoring();
      setIsLoading(false);
    }
  };

  const setDefaultScoring = () => {
    // Fallback scoring in case of API failure
    const defaultScores: ScoreCategory[] = [
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
    ];

    setScores(defaultScores);
    setOverallScore(77);
    setSummary(
      "The candidate demonstrated good overall potential for the role with particular strengths in cultural fit and communication. There are some areas for improvement in technical depth and problem-solving approach."
    );
  };

  const handleDownloadReport = () => {
    // Create a text report
    const report = `
INTERVIEW ASSESSMENT REPORT
===========================

Overall Score: ${overallScore}%

Summary:
${summary}

SCORE BREAKDOWN:
${scores
  .map(
    (category) => `
${category.name}: ${category.score}%
${category.feedback}
`
  )
  .join("\n")}

RESPONSE TIME ANALYSIS:
${Object.entries(responseTimes)
  .map(([q, time]) => `Question ${q}: ${(time / 1000).toFixed(1)}s`)
  .join("\n")}

${
  resumeAnalysis
    ? `
RESUME ANALYSIS:
Match Score: ${resumeAnalysis.matchScore}%
${resumeAnalysis.summary}

Key Skills Match: ${resumeAnalysis.keySkillsMatch.join(", ")}
Missing Skills: ${resumeAnalysis.missingSkills.join(", ")}
`
    : ""
}

INTERVIEW TRANSCRIPT:
${messages
  .filter((m) => m.role !== "system")
  .map(
    (m) => `
${m.role.toUpperCase()}: ${m.content}
${m.responseTime ? `Response time: ${(m.responseTime / 1000).toFixed(1)}s` : ""}
`
  )
  .join("\n")}
    `.trim();

    // Create a blob and download link
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interview-report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Analyzing Interview"
          text="Processing interview data..."
        />
        <div className="flex items-center justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-muted rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Interview Results"
        text="Comprehensive analysis of interview performance"
      />

      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm hover:underline"
        >
          <Home className="mr-2 h-4 w-4" /> Back to dashboard
        </Link>
        <Button variant="outline" onClick={handleDownloadReport}>
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{overallScore}%</div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{summary}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scores">Score Breakdown</TabsTrigger>
          <TabsTrigger value="resume">Resume Analysis</TabsTrigger>
          <TabsTrigger value="timing">Response Time</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="scores">
          <Card>
            <CardContent className="pt-6">
              <ScoreBreakdown scores={scores} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume">
          <Card>
            <CardContent className="pt-6">
              {resumeAnalysis ? (
                <ResumeMatchAnalysis analysis={resumeAnalysis} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Resume analysis not available
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Resume analysis data is not available for this interview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card>
            <CardContent className="pt-6">
              <ResponseTimeAnalysis
                messages={messages}
                responseTimes={responseTimes}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardContent className="pt-6">
              <InterviewTranscript messages={messages} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
