import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

interface ResumeMatchAnalysisProps {
  analysis: {
    matchScore: number
    keySkillsMatch: string[]
    missingSkills: string[]
    experienceRelevance: number
    educationRelevance: number
    strengths: string[]
    weaknesses: string[]
    summary: string
    recommendations: string[]
  }
}

export function ResumeMatchAnalysis({ analysis }: ResumeMatchAnalysisProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium">Resume Match Score</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall match with job requirements</span>
          <span className="font-bold">{analysis.matchScore}%</span>
        </div>
        <Progress value={analysis.matchScore} />
        <p className="text-sm text-muted-foreground mt-2">{analysis.summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="font-medium">Experience Relevance</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Relevance to job requirements</span>
            <span className="font-bold">{analysis.experienceRelevance}%</span>
          </div>
          <Progress value={analysis.experienceRelevance} />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Education Relevance</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Relevance to job requirements</span>
            <span className="font-bold">{analysis.educationRelevance}%</span>
          </div>
          <Progress value={analysis.educationRelevance} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-medium flex items-center mb-3">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Matching Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.keySkillsMatch.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-green-50">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium flex items-center mb-3">
            <XCircle className="mr-2 h-4 w-4 text-red-500" /> Missing Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-red-50">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-medium flex items-center mb-3">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Strengths
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium flex items-center mb-3">
            <XCircle className="mr-2 h-4 w-4 text-red-500" /> Weaknesses
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm">
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Recommendations</h3>
        <ul className="list-disc pl-5 space-y-2">
          {analysis.recommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
