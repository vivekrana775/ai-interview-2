import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">InterviewAI</h1>
          <Link href="/interview/setup">
            <Button>Start New Interview</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Dynamic Interview Assistant
          </h2>
          <p className="text-xl text-muted-foreground">
            Upload a job description and candidate CV to generate personalized
            interview questions, conduct a dynamic interview, and receive
            comprehensive scoring and analysis.
          </p>

          <Link href="/interview/setup" className="inline-block">
            <Button size="lg" className="mt-4 group">
              Start New Interview{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
