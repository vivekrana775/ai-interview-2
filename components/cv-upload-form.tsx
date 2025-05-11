"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";

interface CVUploadFormProps {
  initialValue: string;
  onSubmit: (text: string) => void;
  onAnalysis?: (analysis: any) => void;
  jobDescription?: string;
}

export function CVUploadForm({
  initialValue,
  onSubmit,
  onAnalysis,
  jobDescription,
}: CVUploadFormProps) {
  const [cvText, setCvText] = useState(initialValue);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analyze CV against job description when both are available
  const analyzeCV = async () => {
    if (
      cvText &&
      jobDescription &&
      cvText.length > 100 &&
      !analysis &&
      onAnalysis
    ) {
      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription,
            resume: cvText,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to analyze resume");
        }

        const data = await response.json();
        setAnalysis(data);
        if (onAnalysis) {
          onAnalysis(data);
        }
      } catch (error) {
        console.error("Error analyzing CV:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    // For this demo, we'll just read text files
    // In a real app, you'd use a library to parse PDFs and DOCXs
    if (file.type === "text/plain") {
      const text = await file.text();
      setCvText(text);
      setError("");
      setAnalysis(null); // Reset analysis when new file is uploaded
    } else {
      const formData = new FormData();
      formData.append("file", file); // Your PDF file

      const response = await fetch("/api/extract-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("extracted data", data.extractedDetails);

      setCvText(data?.extractedDetails);
      setError("");
      setAnalysis(null); // Reset analysis when new file is uploaded
    }
  };

  const handleManualEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCvText(e.target.value);
    setIsSubmitted(false);
    setAnalysis(null); // Reset analysis when CV is edited
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Validate the CV text
    if (cvText?.trim()?.length < 50) {
      setError("Please provide more CV content (at least 50 characters).");
      return;
    }

    await analyzeCV();

    setIsAnalyzing(false);

    setError("");
    setIsSubmitted(true);
    onSubmit(cvText);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="cv-upload">Upload CV</Label>
          <span className="text-sm text-muted-foreground">
            Supported formats: PDF, DOCX, TXT
          </span>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            id="cv-upload"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload File
          </Button>

          {fileName && (
            <div className="flex items-center text-sm">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate max-w-[200px]">{fileName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="cv-content">CV Content</Label>
          <span className="text-sm text-muted-foreground">
            You can edit the content manually
          </span>
        </div>

        <Textarea
          id="cv-content"
          placeholder="CV content will appear here after upload, or you can enter it manually..."
          value={cvText}
          onChange={handleManualEdit}
          className="min-h-[300px]"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {isAnalyzing && (
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          Analyzing CV against job description...
        </div>
      )}

      {analysis && (
        <Alert
          className={
            analysis.matchScore >= 70
              ? "bg-green-50"
              : analysis.matchScore >= 50
              ? "bg-yellow-50"
              : "bg-red-50"
          }
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Resume Analysis</AlertTitle>
          <AlertDescription>
            <div className="flex justify-between items-center">
              <span>
                Match Score:{" "}
                <span className="font-bold">{analysis.matchScore}%</span>
              </span>
              <span className="text-sm">
                {analysis.matchScore >= 70
                  ? "Strong match"
                  : analysis.matchScore >= 50
                  ? "Moderate match"
                  : "Low match"}
              </span>
            </div>
            <p className="text-sm mt-1">{analysis.summary}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={cvText?.trim()?.length < 50 || isSubmitted}
        >
          {isSubmitted ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Submitted
            </>
          ) : (
            "Submit CV"
          )}
        </Button>
      </div>
    </form>
  );
}
