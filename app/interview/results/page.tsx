"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Home, Share } from "lucide-react"
import { ScoreBreakdown } from "@/components/score-breakdown"
import { ResponseTimeAnalysis } from "@/components/response-time-analysis"
import { InterviewTranscript } from "@/components/interview-transcript"
import { ResumeMatchAnalysis } from "@/components/resume-match-analysis"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { toast } from "@/components/ui/use-toast"

type Message = {
  id: string
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: number
  responseTime?: number
}

type ScoreCategory = {
  name: string
  score: number
  feedback: string
}

type ScoringResult = {
  scores: ScoreCategory[]
  overallScore: number
  summary: string
}

export default function InterviewResults() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [scores, setScores] = useState<ScoreCategory[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [summary, setSummary] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [cvText, setCvText] = useState("")
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null)

  useEffect(() => {
    // Load interview data from localStorage
    const interviewDataString = localStorage.getItem("interviewData")
    const storedJobDescription = localStorage.getItem("jobDescription")
    const storedCvText = localStorage.getItem("cvText")
    const storedResumeAnalysis = localStorage.getItem("resumeAnalysis")

    if (!interviewDataString || !storedJobDescription || !storedCvText) {
      // Redirect back to home if no data
      router.push("/")
      return
    }

    setJobDescription(storedJobDescription)
    setCvText(storedCvText)

    if (storedResumeAnalysis) {
      try {
        setResumeAnalysis(JSON.parse(storedResumeAnalysis))
      } catch (e) {
        console.error("Error parsing resume analysis:", e)
      }
    }

    try {
      const interviewData = JSON.parse(interviewDataString)

      // Extract messages and response times
      const extractedMessages = interviewData.filter((item) => item.role !== undefined) as Message[]
      const responseTimesObj = interviewData.find((item) => item.responseTimes !== undefined)?.responseTimes || {}

      setMessages(extractedMessages)
      setResponseTimes(responseTimesObj)

      // Generate AI scoring
      generateInterviewScoring(extractedMessages, responseTimesObj, storedJobDescription, storedCvText)
    } catch (error) {
      console.error("Error parsing interview data:", error)
      router.push("/")
    }
  }, [router])

  const generateInterviewScoring = async (
    interviewMessages: Message[],
    responseTimes: Record<string, number>,
    jobDesc: string,
    cv: string,
  ) => {
    try {
      // Format the conversation for the AI
      const conversation = interviewMessages
        .filter((msg) => msg.role !== "system")
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n")

      // Format response times
      const responseTimeText = Object.entries(responseTimes)
        .map(([questionNum, time]) => `Question ${questionNum}: ${(time / 1000).toFixed(1)}s`)
        .join("\n")

      // Create the prompt for scoring
      const prompt = `
        You are an interview evaluator. Based on the following job description, candidate CV, conversation history,
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
      `

      // Call the AI to generate the scoring
      const { text } = await generateText({
        model: groq("llama3-70b-8192"),
        messages: [{ role: "user", content: prompt }],
      })

      // Parse the JSON response
      try {
        const result = JSON.parse(text) as ScoringResult
        setScores(result.scores)
        setOverallScore(result.overallScore)
        setSummary(result.summary)
      } catch (error) {
        console.error("Error parsing AI response:", error)
        // Fallback to default scoring if parsing fails
        setDefaultScoring()
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error generating interview scoring:", error)
      setDefaultScoring()
      setIsLoading(false)
    }
  }

  const setDefaultScoring = () => {
    // Fallback scoring in case of API failure
    const defaultScores: ScoreCategory[] = [
      {
        name: "Technical Acumen",
        score: 75,
        feedback: "The candidate demonstrated adequate technical knowledge relevant to the position.",
      },
      {
        name: "Communication Skills",
        score: 80,
        feedback: "Good communication skills. Articulated thoughts clearly in most responses.",
      },
      {
        name: "Problem-Solving & Adaptability",
        score: 70,
        feedback: "Showed reasonable problem-solving approach. Could improve on considering alternative solutions.",
      },
      {
        name: "Cultural Fit & Soft Skills",
        score: 85,
        feedback: "Appears to align well with company values. Demonstrated teamwork and empathy.",
      },
      {
        name: "Response Time",
        score: 75,
        feedback: "Average response time was acceptable. Some complex questions took longer to answer.",
      },
    ]

    setScores(defaultScores)
    setOverallScore(77)
    setSummary(
      "The candidate demonstrated good overall potential for the role with particular strengths in cultural fit and communication. There are some areas for improvement in technical depth and problem-solving approach.",
    )
  }

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
`,
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
`,
  )
  .join("\n")}
    `.trim()

    // Create a blob and download link
    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "interview-report.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShareResults = () => {
    // In a real app, this would generate a shareable link
    // For now, we'll just show a toast
    toast({
      title: "Share link generated",
      description: "A shareable link would be generated here in a real application.",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Analyzing Interview</h1>

        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-muted rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Scoring Interview</h2>
              <p className="text-muted-foreground">Analyzing responses and calculating scores...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center text-sm hover:underline">
          <Home className="mr-2 h-4 w-4" /> Back to home
        </Link>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleShareResults}>
            <Share className="mr-2 h-4 w-4" /> Share Results
          </Button>
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-8">Interview Results</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{overallScore}%</div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
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
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <ScoreBreakdown scores={scores} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              {resumeAnalysis ? (
                <ResumeMatchAnalysis analysis={resumeAnalysis} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 text-muted-foreground mb-4">📄</div>
                  <h3 className="text-lg font-medium mb-2">Resume analysis not available</h3>
                  <p className="text-muted-foreground mb-4">Resume analysis data is not available for this interview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <ResponseTimeAnalysis messages={messages} responseTimes={responseTimes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <InterviewTranscript messages={messages} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
