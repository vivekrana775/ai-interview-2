"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type Evaluation = {
  scores: {
    technical: number;
    communication: number;
    responsiveness: number;
    problemSolving: number;
    culturalFit: number;
  };
  overallScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  metrics: {
    responseTime: number;
  };
};

export default function ResultsPage() {
  const [results, setResults] = useState<Evaluation | null>(null);

  useEffect(() => {
    const savedResults = localStorage.getItem("interviewEvaluation");
    if (savedResults) setResults(JSON.parse(savedResults));
  }, []);

  if (!results)
    return <div className="p-8 text-center">Loading results...</div>;

  const chartData = {
    labels: [
      "Technical",
      "Communication",
      "Responsiveness",
      "Problem-Solving",
      "Culture Fit",
    ],
    datasets: [
      {
        label: "Performance",
        data: [
          results.scores.technical,
          results.scores.communication,
          results.scores.responsiveness,
          results.scores.problemSolving,
          results.scores.culturalFit,
        ],
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <Link href="/interview/setup">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> New Interview
        </Button>
      </Link>

      <h1 className="text-3xl font-bold">Interview Evaluation</h1>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Overall Score</h2>
              <p className="text-muted-foreground">
                Based on 5 evaluation criteria
              </p>
            </div>
            <div className="text-5xl font-bold">{results.overallScore}/100</div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="h-64">
            <Radar data={chartData} />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Average Response Time</h3>
              <p className="text-2xl">{results.metrics.responseTime} seconds</p>
            </div>
            <div>
              <h3 className="font-medium">Summary</h3>
              <p className="whitespace-pre-line">{results.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Strengths</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {results.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                  <p>{strength}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Areas for Improvement</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {results.improvements.map((improvement, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-5 w-5 text-yellow-500">↳</div>
                  <p>{improvement}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <CardFooter className="flex justify-end">
        <Link href="/interview/setup">
          <Button>Start New Interview</Button>
        </Link>
      </CardFooter>
    </div>
  );
}
