"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

export default function ResumeAnalysisPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [jobDescription, setJobDescription] = useState("")
  const [resume, setResume] = useState("")
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Get data from localStorage
        const storedJobDescription = localStorage.getItem("jobDescription")
        const storedCvText = localStorage.getItem("cvText")
        const storedResumeAnalysis = localStorage.getItem("resumeAnalysis")

        if (!storedJobDescription || !storedCvText) {
          router.push("/interview/setup")
          return
        }

        setJobDescription(storedJobDescription)
        setResume(storedCvText)

        // Use stored analysis if available
        if (storedResumeAnalysis) {
          try {
            setAnalysis(JSON.parse(storedResumeAnalysis))
            setIsLoading(false)
            return
          } catch (e) {
            console.error("Error parsing stored resume analysis:", e)
          }
        }

        // Analyze resume if no stored analysis
        const response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription: storedJobDescription,
            resume: storedCvText,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to analyze resume")
        }

        const data = await response.json()
        setAnalysis(data)
        localStorage.setItem("resumeAnalysis", JSON.stringify(data))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Resume Analysis</h1>
        <div className="flex items-center justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-muted rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Resume Analysis</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium mb-2">Analysis not available</h3>
          <p className="text-muted-foreground mb-4">We couldn't generate an analysis for this resume</p>
          <Link href="/interview/setup">
            <Button>Return to Setup</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/interview/session" className="inline-flex items-center text-sm hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to interview
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Resume Analysis</h1>
      <p className="text-muted-foreground mb-6">Detailed analysis of resume against job requirements</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-sm font-medium">Overall Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analysis.matchScore}%</div>
            <Progress
              value={analysis.matchScore}
              className="mt-2"
              indicatorClassName={`${analysis.matchScore >= 70 ? "bg-green-500" : analysis.matchScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
            />
            <p className="text-sm text-muted-foreground mt-2">{analysis.summary}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-sm font-medium">Experience Relevance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analysis.experienceRelevance}%</div>
            <Progress value={analysis.experienceRelevance} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-sm font-medium">Education Relevance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analysis.educationRelevance}%</div>
            <Progress value={analysis.educationRelevance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle>Skills Analysis</CardTitle>
            <CardDescription>Matching and missing skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Matching Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keySkillsMatch.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-green-50 border-green-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <XCircle className="mr-2 h-4 w-4 text-red-500" /> Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-red-50 border-red-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle>Strengths & Weaknesses</CardTitle>
            <CardDescription>Key strengths and areas for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Strengths
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <XCircle className="mr-2 h-4 w-4 text-red-500" /> Weaknesses
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {analysis.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="text-sm">
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Suggestions for improving resume for this position</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {analysis.recommendations.map((recommendation: string, index: number) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
