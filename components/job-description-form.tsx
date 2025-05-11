"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"

interface JobDescriptionFormProps {
  initialValue: string
  onSubmit: (description: string) => void
}

export function JobDescriptionForm({ initialValue, onSubmit }: JobDescriptionFormProps) {
  const [description, setDescription] = useState(initialValue)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate the job description
    if (description.trim().length < 100) {
      setError("Please provide a more detailed job description (at least 100 characters).")
      return
    }

    setError("")
    onSubmit(description)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job-description">Job Description</Label>
        <Textarea
          id="job-description"
          placeholder="Enter the full job description here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[300px]"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-sm text-muted-foreground">Character count: {description.length} (minimum 100)</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={description.trim().length < 100}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
