import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

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
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Dynamic Interview Assistant</h2>
          <p className="text-xl text-muted-foreground">
            Upload a job description and candidate CV to generate personalized interview questions, conduct a dynamic
            interview, and receive comprehensive scoring and analysis.
          </p>

          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">For Recruiters</h3>
              <p className="text-muted-foreground mb-4">
                Streamline your interview process with generated questions tailored to both the job and candidate.
              </p>
              <ul className="space-y-2 mb-4 text-left">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Personalized question generation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Automated interview scoring</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Response time analysis</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">For Candidates</h3>
              <p className="text-muted-foreground mb-4">
                Experience a fair and relevant interview process tailored to your skills and experience.
              </p>
              <ul className="space-y-2 mb-4 text-left">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Relevant questions based on your CV</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Dynamic follow-up questions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Comprehensive feedback</span>
                </li>
              </ul>
            </div>
          </div>

          <Link href="/interview/setup" className="inline-block">
            <Button size="lg" className="mt-4 group">
              Start New Interview <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t py-6 bg-gray-50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 InterviewAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
