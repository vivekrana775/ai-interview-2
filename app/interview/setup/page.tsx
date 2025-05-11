"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobDescriptionForm } from "@/components/job-description-form"
import { CVUploadForm } from "@/components/cv-upload-form"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

export default function InterviewSetup() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("job-description")
  const [jobDescription, setJobDescription] = useState("")
  const [cvText, setCvText] = useState("")
  const [isJobDescriptionComplete, setIsJobDescriptionComplete] = useState(false)
  const [isCvComplete, setIsCvComplete] = useState(false)
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null)

  // Load any existing data from localStorage
  useEffect(() => {
    const storedJobDescription = localStorage.getItem("jobDescription")
    const storedCvText = localStorage.getItem("cvText")

    if (storedJobDescription) {
      setJobDescription(storedJobDescription)
      setIsJobDescriptionComplete(true)
    }

    if (storedCvText) {
      setCvText(storedCvText)
      setIsCvComplete(true)
    }
  }, [])

  const handleJobDescriptionSubmit = (description: string) => {
    setJobDescription(description)
    setIsJobDescriptionComplete(true)
    setActiveTab("cv-upload")
  }

  const handleCvSubmit = (text: string) => {
    setCvText(text)
    setIsCvComplete(true)
  }

  const handleResumeAnalysis = (analysis: any) => {
    setResumeAnalysis(analysis)
  }

  const handleStartInterview = async () => {
    if (!isJobDescriptionComplete || !isCvComplete) {
      toast({
        title: "Missing information",
        description: "Please complete both job description and CV sections",
        variant: "destructive",
      })
      return
    }

    try {
      // Store the interview data in localStorage for the session
      localStorage.setItem("interviewId", Date.now().toString())
      localStorage.setItem("jobDescription", jobDescription)
      localStorage.setItem("cvText", cvText)
      if (resumeAnalysis) {
        localStorage.setItem("resumeAnalysis", JSON.stringify(resumeAnalysis))
      }

      // Navigate to the interview page
      router.push("/interview/session")
    } catch (error) {
      console.error("Error setting up interview:", error)
      toast({
        title: "Error setting up interview",
        description: "There was an error setting up the interview. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Interview Setup</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new interview by providing a job description and candidate CV
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <Link href="/" className="inline-flex items-center text-sm hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
        </Link>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="job-description" disabled={activeTab === "cv-upload" && !isJobDescriptionComplete}>
              1. Job Description
              {isJobDescriptionComplete && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="cv-upload" disabled={!isJobDescriptionComplete}>
              2. Candidate CV
              {isCvComplete && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job-description">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Enter the job description to help generate relevant interview questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <JobDescriptionForm initialValue={jobDescription} onSubmit={handleJobDescriptionSubmit} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cv-upload">
            <Card>
              <CardHeader>
                <CardTitle>Candidate CV</CardTitle>
                <CardDescription>Upload the candidate's CV to personalize the interview questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CVUploadForm
                  initialValue={cvText}
                  onSubmit={handleCvSubmit}
                  onAnalysis={handleResumeAnalysis}
                  jobDescription={isJobDescriptionComplete ? jobDescription : undefined}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("job-description")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleStartInterview} disabled={!isJobDescriptionComplete || !isCvComplete}>
                  Start Interview <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
