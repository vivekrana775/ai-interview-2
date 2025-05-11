import { Progress } from "@/components/ui/progress"

type ScoreCategory = {
  name: string
  score: number
  feedback: string
}

interface ScoreBreakdownProps {
  scores: ScoreCategory[]
}

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  return (
    <div className="space-y-8">
      {scores.map((category, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{category.name}</h3>
            <span className="font-bold">{category.score}%</span>
          </div>
          <Progress value={category.score} />
          <p className="text-sm text-muted-foreground mt-2">{category.feedback}</p>
        </div>
      ))}
    </div>
  )
}
