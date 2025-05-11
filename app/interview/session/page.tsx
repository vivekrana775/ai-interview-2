"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChatInterface } from "@/components/chat-interface"
import { LoadingQuestions } from "@/components/loading-questions"
import { Send, Clock, AlertCircle, Mic, MicOff, ArrowLeft } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

type Message = {
  id: string
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: number
  responseTime?: number
}

export default function InterviewSession() {
  const router = useRouter()
  const [jobDescription, setJobDescription] = useState("")
  const [cvText, setCvText] = useState("")
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInterviewComplete, setIsInterviewComplete] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null)
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({})
  const [questionCount, setQuestionCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [resumeScore, setResumeScore] = useState<any>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Use the AI SDK's useChat hook
  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    append,
    reload,
    stop,
    error,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      jobDescription,
      cvText,
      interviewId,
    },
    onFinish: (message) => {
      // Start timing for the next response
      setQuestionStartTime(Date.now())
      setQuestionCount((prev) => prev + 1)

      // Check if we should end the interview after 5-7 questions
      if (questionCount >= 6) {
        setTimeout(() => {
          const finalMessage = {
            id: Date.now().toString(),
            role: "assistant" as const,
            content:
              "Thank you for completing this interview. I have all the information I need to provide an assessment. Let me analyze your responses and provide feedback.",
          }
          append(finalMessage)
          setIsInterviewComplete(true)

          // Navigate to results page after a short delay
          setTimeout(() => {
            // Store interview data for the results page
            localStorage.setItem("interviewData", JSON.stringify([...aiMessages, finalMessage, { responseTimes }]))
            router.push(`/interview/results`)
          }, 3000)
        }, 1000)
      }
    },
  })

  // Load job description and CV from localStorage
  useEffect(() => {
    const loadInterviewData = async () => {
      setIsLoading(true)

      try {
        // Check for job description and CV
        const storedJobDescription = localStorage.getItem("jobDescription")
        const storedCvText = localStorage.getItem("cvText")
        const storedResumeAnalysis = localStorage.getItem("resumeAnalysis")

        if (!storedJobDescription || !storedCvText) {
          // Redirect back to setup if data is missing
          toast({
            title: "Missing interview data",
            description: "Please set up your interview first",
            variant: "destructive",
          })
          router.push("/interview/setup")
          return
        }

        setJobDescription(storedJobDescription)
        setCvText(storedCvText)

        if (storedResumeAnalysis) {
          try {
            setResumeScore(JSON.parse(storedResumeAnalysis))
          } catch (e) {
            console.error("Error parsing resume analysis:", e)
          }
        }

        // Generate a unique ID for this interview
        const newInterviewId = Date.now().toString()
        setInterviewId(newInterviewId)
        localStorage.setItem("interviewId", newInterviewId)

        // Analyze resume against job description if not already done
        if (!storedResumeAnalysis) {
          analyzeResume(storedJobDescription, storedCvText)
        }

        // Initialize the chat with a system message
        const systemMessage = {
          role: "system" as const,
          content: `You are an interviewer conducting a job interview. 
          
          Job Description:
          ${storedJobDescription}
          
          Candidate CV:
          ${storedCvText}
          
          Your task is to ask relevant questions based on the job description and CV,
          and follow up with appropriate questions based on the candidate's responses.
          Be professional, conversational, and insightful in your questioning.
          
          Start by introducing yourself as an interviewer and ask your first question.
          Ask one question at a time and wait for the candidate's response before asking the next question.`,
        }

        append(systemMessage)
      } catch (error) {
        console.error("Error in loadInterviewData:", error)
        toast({
          title: "Error loading interview",
          description: "There was a problem loading the interview data. Please try again.",
          variant: "destructive",
        })
        router.push("/interview/setup")
      } finally {
        setIsLoading(false)
      }
    }

    loadInterviewData()
  }, [router, append])

  // Analyze resume against job description
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
      })

      if (!response.ok) {
        throw new Error("Failed to analyze resume")
      }

      const data = await response.json()
      setResumeScore(data)
      localStorage.setItem("resumeAnalysis", JSON.stringify(data))
    } catch (error) {
      console.error("Error analyzing resume:", error)
    }
  }

  // Initialize speech recognition if available
  useEffect(() => {
    // Request microphone permission
    const initializeAudioRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

        // Create media recorder
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          audioChunksRef.current = []

          // Here you would normally send the audio to a speech-to-text service
          // For this demo, we'll just simulate it
          setTimeout(() => {
            const simulatedText =
              "This is a simulated transcription of what would be the actual speech-to-text conversion. In a real implementation, this would be the text from the audio recording."
            if (inputRef.current) {
              inputRef.current.value = simulatedText
              handleInputChange({ target: { value: simulatedText } } as React.ChangeEvent<HTMLTextAreaElement>)
            }
          }, 1000)
        }
      } catch (error) {
        console.error("Error accessing microphone:", error)
        setRecordingError("Could not access microphone. Please check your browser permissions.")
      }
    }

    initializeAudioRecording()

    return () => {
      // Clean up
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // Enhanced submit handler to track response times
  const handleEnhancedSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (input.trim() === "") {
      toast({
        title: "Empty response",
        description: "Please provide an answer before submitting",
        variant: "destructive",
      })
      return
    }

    // Record response time if we have a start time
    if (questionStartTime) {
      const responseTime = Date.now() - questionStartTime
      setResponseTimes((prev) => ({
        ...prev,
        [questionCount.toString()]: responseTime,
      }))
      setQuestionStartTime(null)
    }

    // Submit the form using AI SDK's handleSubmit
    handleSubmit(e)
  }

  // Toggle audio recording
  const toggleRecording = () => {
    if (!mediaRecorderRef.current) {
      setRecordingError("Microphone not available")
      return
    }

    if (isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    } else {
      audioChunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      })
    }
  }

  // Convert AI SDK messages to our Message format
  const formattedMessages: Message[] = aiMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: Date.now(),
    responseTime: msg.role === "user" && questionCount > 0 ? responseTimes[questionCount.toString()] : undefined,
  }))

  if (isLoading) {
    return <LoadingQuestions />
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error starting the interview: {error.message}
            <div className="mt-2">
              <Button onClick={() => router.push("/interview/setup")}>Return to Setup</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 max-w-4xl h-screen flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/interview/setup" className="mr-4">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Interview Session</h1>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>Response times are being recorded</span>
        </div>
      </div>

      {resumeScore && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <AlertTitle>Resume Analysis</AlertTitle>
              <AlertDescription>
                Match Score: <span className="font-bold">{resumeScore.matchScore}%</span> - {resumeScore.summary}
              </AlertDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push(`/resume-analysis`)}>
              View Details
            </Button>
          </div>
        </Alert>
      )}

      {recordingError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{recordingError}</AlertDescription>
        </Alert>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
        <ChatInterface
          messages={formattedMessages}
          isInterviewComplete={isInterviewComplete}
          isLoading={isChatLoading}
        />

        <div className="p-4 border-t">
          <form onSubmit={handleEnhancedSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                placeholder="Type your answer here..."
                value={input}
                onChange={handleInputChange}
                disabled={isInterviewComplete || isChatLoading}
                className="min-h-[80px] resize-none"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={input.trim() === "" || isInterviewComplete || isChatLoading}
                  className="h-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={toggleRecording}
                  disabled={isInterviewComplete || !!recordingError}
                  className="h-10"
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {isRecording && (
              <div className="text-sm text-red-500 flex items-center animate-pulse">
                <Mic className="mr-1 h-3 w-3" />
                <span>Recording in progress...</span>
              </div>
            )}
            {questionStartTime && (
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>Timer running...</span>
              </div>
            )}
          </form>
        </div>
      </Card>
    </div>
  )
}
