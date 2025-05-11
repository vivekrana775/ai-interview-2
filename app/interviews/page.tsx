"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle, Eye } from "lucide-react";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interviewId = localStorage.getItem("interviewId");
    const jobDescription = localStorage.getItem("jobDescription");
    const cvText = localStorage.getItem("cvText");
    const interviewData = localStorage.getItem("interviewData");

    if (interviewId && jobDescription && cvText) {
      const hasResults = !!interviewData;

      setInterviews([
        {
          id: interviewId,
          date: new Date().toISOString(),
          status: hasResults ? "completed" : "in-progress",
          jobDescription: jobDescription.substring(0, 100) + "...",
        },
      ]);
    }

    setIsLoading(false);
  }, []);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your interviews
          </p>
        </div>
        <Link href="/interview/setup">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Interview
          </Button>
        </Link>
      </div>

      <Link
        href="/"
        className="inline-flex items-center text-sm hover:underline mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
      </Link>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded animate-pulse w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-muted rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between">
                <div className="h-9 bg-muted rounded animate-pulse w-20"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg border">
          <div className="h-12 w-12 text-muted-foreground mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No interviews yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by creating your first interview
          </p>
          <Link href="/interview/setup">
            <Button>Create Interview</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <Card
              key={interview.id}
              className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <h3 className="font-semibold mb-1 truncate">
                    Interview {new Date(interview.date).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {interview.jobDescription}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge
                      variant={
                        interview.status === "completed" ? "default" : "outline"
                      }
                      className={
                        interview.status === "completed"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : ""
                      }
                    >
                      {interview.status === "completed"
                        ? "Completed"
                        : "In Progress"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(interview.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between">
                <Link
                  href={
                    interview.status === "completed"
                      ? `/interview/results`
                      : `/interview/session`
                  }
                >
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    {interview.status === "completed"
                      ? "View Results"
                      : "Continue"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
