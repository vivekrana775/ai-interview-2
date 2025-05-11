"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

type Message = {
  id: string
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: number
  responseTime?: number
}

interface ChatInterfaceProps {
  messages: Message[]
  isInterviewComplete: boolean
  isLoading?: boolean
}

export function ChatInterface({ messages, isInterviewComplete, isLoading = false }: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [messages])

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground text-center">
              Your interview will begin shortly. The AI interviewer will ask you questions based on the job description
              and your CV.
            </p>
          </div>
        )}

        {messages.map((message) => {
          // Skip system messages
          if (message.role === "system") return null

          return (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="h-8 w-8">
                  {message.role === "user" ? (
                    <>
                      <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    </>
                  ) : (
                    <>
                      <AvatarFallback className="bg-blue-500 text-white">AI</AvatarFallback>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    </>
                  )}
                </Avatar>

                <div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-blue-50 border border-blue-100"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === "user" && message.responseTime && (
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      Response time: {(message.responseTime / 1000).toFixed(1)}s
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-500 text-white">AI</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px] rounded" />
                <Skeleton className="h-4 w-[200px] rounded" />
                <Skeleton className="h-4 w-[170px] rounded" />
              </div>
            </div>
          </div>
        )}

        {isInterviewComplete && (
          <div className="text-center py-4 px-6 bg-green-50 border border-green-100 rounded-lg my-6">
            <p className="text-green-700 font-medium">Interview complete!</p>
            <p className="text-sm text-green-600">Analyzing responses and preparing your results...</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
