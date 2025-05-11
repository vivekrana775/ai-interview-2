import { Card } from "@/components/ui/card"

export function LoadingQuestions() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Preparing Interview</h1>

      <Card className="p-8 shadow-md">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-muted rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Generating Interview Questions</h2>
            <p className="text-muted-foreground">
              Analyzing job description and CV to create personalized questions...
            </p>
          </div>

          <div className="w-full max-w-md mt-8">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-4/6"></div>
            </div>

            <div className="space-y-2 mt-6">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
