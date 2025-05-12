"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

type TimingMetric = {
  questionId: string;
  startTime: number;
  endTime: number;
  duration: number;
};

export default function InterviewSession() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [timings, setTimings] = useState<TimingMetric[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const questionStartTime = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isResponding,
    append,
  } = useChat({
    api: "/api/interview",
    initialMessages: [],
    body: {
      jobDescription,
      cvText,
      currentTimings: timings,
    },
    onResponse: (response) => {
      const questionId = `q-${Date.now()}`;
      setCurrentQuestionId(questionId);
      questionStartTime.current = Date.now();
    },
    onFinish: async (message) => {
      // Record timing for the last answer
      if (questionStartTime.current && currentQuestionId) {
        setTimings((prev) => [
          ...prev,
          {
            questionId: currentQuestionId,
            startTime: questionStartTime.current,
            endTime: Date.now(),
            duration: Date.now() - questionStartTime.current,
          },
        ]);
      }

      // Auto-trigger evaluation after 5 questions
      if (messages.filter((m) => m.role === "assistant").length >= 5) {
        setTimeout(async () => {
          await evaluateInterview();
        }, 10000);
      }
    },
  });

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setViolationCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            // End interview after 3 violations
            toast({
              title: "Interview Terminated",
              description:
                "You switched tabs too many times. The interview has been ended.",
              variant: "destructive",
            });
            evaluateInterview();
          } else {
            toast({
              title: "Warning",
              description: `Please stay on this tab during the interview. Warning ${newCount}/3`,
              variant: "destructive",
            });
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Prevent navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Are you sure you want to leave? Your interview progress may be lost.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Prevent back button
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      toast({
        title: "Warning",
        description:
          "Please use the navigation within the interview interface.",
        variant: "destructive",
      });
      window.history.pushState(null, "", window.location.pathname);
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, []);

  const evaluateInterview = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          jobDescription,
          cvText,
          timings,
          violationCount,
        }),
      });

      const evaluation = await response.json();
      localStorage.setItem("interviewEvaluation", JSON.stringify(evaluation));
      router.push("/interview/results");
    } catch (error) {
      toast({
        title: "Evaluation failed",
        description: "Could not generate results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    // Load interview context
    const jd = localStorage.getItem("jobDescription");
    const cv = localStorage.getItem("cvText");

    if (!jd || !cv) {
      toast({
        title: "Setup required",
        description: "Please configure your interview first",
        variant: "destructive",
      });
      router.push("/interview/setup");
      return;
    }

    setJobDescription(jd);
    setCvText(cv);

    // Start interview immediately
    append({
      role: "user",
      content:
        "Start the interview with the first question based on my CV and the job description.",
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Record timing before submitting
    if (questionStartTime.current && currentQuestionId) {
      setTimings((prev) => [
        ...prev,
        {
          questionId: currentQuestionId,
          startTime: questionStartTime.current,
          endTime: Date.now(),
          duration: Date.now() - questionStartTime.current,
        },
      ]);
    }

    handleSubmit(e);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl flex flex-col h-screen">
      <header className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">AI Interview Session</h1>
        <div className="ml-auto flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          {timings.length > 0 && (
            <span>
              Avg. response:{" "}
              {Math.round(
                timings.reduce((sum, t) => sum + t.duration, 0) /
                  timings.length /
                  1000
              )}
              s
            </span>
          )}
          {violationCount > 0 && (
            <span className="ml-4 text-destructive">
              Warnings: {violationCount}/3
            </span>
          )}
        </div>
      </header>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-lg max-w-[90%] ${
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted"
              }`}
            >
              {m.content}
            </div>
          ))}
          {(isResponding || isEvaluating) && (
            <div className="mr-auto p-4 rounded-lg bg-muted max-w-[90%]">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleAnswerSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your answer..."
              className="min-h-[100px] resize-none"
              disabled={isResponding || isEvaluating}
              required
            />
            <Button
              type="submit"
              disabled={!input.trim() || isResponding || isEvaluating}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
