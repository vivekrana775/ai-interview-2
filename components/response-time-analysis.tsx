"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type Message = {
  id: string
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: number
  responseTime?: number
}

interface ResponseTimeAnalysisProps {
  messages: Message[]
  responseTimes: Record<string, number>
}

export function ResponseTimeAnalysis({ messages, responseTimes }: ResponseTimeAnalysisProps) {
  // Calculate average response time
  const averageResponseTime = useMemo(() => {
    const times = Object.values(responseTimes)
    if (times.length === 0) return 0

    const total = times.reduce((sum, time) => sum + time, 0)
    return total / times.length / 1000 // Convert to seconds
  }, [responseTimes])

  // Prepare data for chart
  const chartData = useMemo(() => {
    return Object.entries(responseTimes).map(([questionNum, time]) => ({
      name: `Q${questionNum}`,
      responseTime: time / 1000, // Convert to seconds
    }))
  }, [responseTimes])

  // Find fastest and slowest response
  const fastestResponse = useMemo(() => {
    if (Object.keys(responseTimes).length === 0) return { index: 0, time: 0 }

    let fastest = { index: "", time: Number.MAX_VALUE }

    Object.entries(responseTimes).forEach(([questionNum, time]) => {
      if (time < fastest.time) {
        fastest = { index: questionNum, time }
      }
    })

    return { index: fastest.index, time: fastest.time / 1000 }
  }, [responseTimes])

  const slowestResponse = useMemo(() => {
    if (Object.keys(responseTimes).length === 0) return { index: 0, time: 0 }

    let slowest = { index: "", time: 0 }

    Object.entries(responseTimes).forEach(([questionNum, time]) => {
      if (time > slowest.time) {
        slowest = { index: questionNum, time }
      }
    })

    return { index: slowest.index, time: slowest.time / 1000 }
  }, [responseTimes])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageResponseTime.toFixed(1)}s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fastest Response</CardTitle>
            <CardDescription>Question {fastestResponse.index}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fastestResponse.time.toFixed(1)}s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Slowest Response</CardTitle>
            <CardDescription>Question {slowestResponse.index}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slowestResponse.time.toFixed(1)}s</div>
          </CardContent>
        </Card>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: "Seconds", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(value) => [`${value}s`, "Response Time"]} />
            <Bar dataKey="responseTime" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-2">Response Time Analysis</h3>
        <p className="text-sm text-muted-foreground">
          The candidate's response times varied throughout the interview. The fastest response was to Question{" "}
          {fastestResponse.index} ({fastestResponse.time.toFixed(1)}s), while the slowest was to Question{" "}
          {slowestResponse.index} ({slowestResponse.time.toFixed(1)}s). The average response time of{" "}
          {averageResponseTime.toFixed(1)}s indicates {averageResponseTime < 20 ? "good" : "moderate"} engagement with
          the questions.
          {averageResponseTime < 15
            ? " Quick response times suggest the candidate was well-prepared and confident in their answers."
            : averageResponseTime < 30
              ? " Response times indicate thoughtful consideration of the questions."
              : " Longer response times may indicate deeper reflection or uncertainty with some questions."}
        </p>
      </div>
    </div>
  )
}
