import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  id: string
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: number
  responseTime?: number
}

interface InterviewTranscriptProps {
  messages: Message[]
}

export function InterviewTranscript({ messages }: InterviewTranscriptProps) {
  // Filter out system messages
  const visibleMessages = messages.filter((message) => message.role !== "system")

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        {visibleMessages.map((message, index) => {
          const isQuestion = message.role === "assistant" && index > 0
          const isAnswer = message.role === "user"

          return (
            <div key={message.id} className="space-y-2">
              {isQuestion && <div className="font-medium">Question {Math.ceil(index / 2)}:</div>}

              <div className={`p-4 rounded-lg ${isQuestion ? "bg-muted" : isAnswer ? "bg-primary/10" : ""}`}>
                <div className={`text-sm ${isAnswer ? "font-medium" : ""}`}>{message.content}</div>

                {isAnswer && message.responseTime && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Response time: {(message.responseTime / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
