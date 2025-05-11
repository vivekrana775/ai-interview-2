"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

type InterviewData = {
  messages: any[];
  evaluation?: {
    score: number;
    feedback: string;
    strengths: string[];
    areasForImprovement: string[];
  };
};

export default function InterviewSession() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    setMessages,
    stop,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      jobDescription,
      cvText,
    },
    onFinish: async (message) => {
      // Check if interview should end (after 5-7 questions)
      const assistantMessages = messages.filter((m) => m.role === "assistant");
      if (assistantMessages.length >= 5 && !interviewComplete) {
        await evaluateInterview();
      }
    },
  });

  const evaluateInterview = async () => {
    setInterviewComplete(true);
    const evaluationMessage = {
      role: "user" as const,
      content:
        "Please evaluate my interview performance and provide a score from 1-10 along with detailed feedback, strengths, and areas for improvement based on my responses.",
    };

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, evaluationMessage],
        jobDescription,
        cvText,
      }),
    });

    if (!response.ok) {
      throw new Error("Evaluation failed");
    }

    const data = await response.json();
    const interviewData: InterviewData = {
      messages: [...messages, { role: "assistant", content: data.content }],
      evaluation: {
        score: data.score || 7,
        feedback: data.feedback || "No feedback generated",
        strengths: data.strengths || [],
        areasForImprovement: data.areasForImprovement || [],
      },
    };

    localStorage.setItem("interviewResults", JSON.stringify(interviewData));
    router.push("/interview/results");
  };

  useEffect(() => {
    const storedJobDescription = localStorage.getItem("jobDescription");
    const storedCvText = localStorage.getItem("cvText");

    if (!storedJobDescription || !storedCvText) {
      toast({
        title: "Missing interview data",
        description: "Please set up your interview first",
        variant: "destructive",
      });
      router.push("/interview/setup");
      return;
    }

    setJobDescription(storedJobDescription);
    setCvText(storedCvText);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <p>Preparing your interview questions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 max-w-4xl h-screen flex flex-col">
      <div className="mb-4 flex items-center">
        <Link href="/interview/setup" className="mr-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Interview Session</h1>
        <div className="ml-auto text-sm text-gray-500">
          Questions: {messages.filter((m) => m.role === "assistant").length}/7
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-50 ml-auto max-w-[80%]"
                  : "bg-gray-50 mr-auto max-w-[80%]"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {isChatLoading && (
            <div className="mb-4 p-4 rounded-lg bg-gray-50 mr-auto max-w-[80%]">
              <p>Thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {!interviewComplete && (
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                placeholder="Type your answer here..."
                value={input}
                onChange={handleInputChange}
                disabled={isChatLoading}
                className="min-h-[80px] resize-none flex-1"
              />
              <Button
                type="submit"
                disabled={input.trim() === "" || isChatLoading}
                className="h-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
