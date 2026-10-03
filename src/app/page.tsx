"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnalysisResult } from "@/lib/types";

export default function CareerMatchAI() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setError(null);
    },
    onDropRejected: () => {
      setError("Please upload a valid PDF or TXT file under 5MB.");
    },
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please provide a job description.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze resume.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadDemo = () => {
    setJobDescription(
      "We are looking for a Senior Frontend Engineer with 5+ years of experience in React and TypeScript. You will be responsible for building scalable web applications, optimizing performance, and collaborating with cross-functional teams. Required skills: React, TypeScript, Next.js, Tailwind CSS, REST APIs. Preferred skills: GraphQL, AWS, Docker."
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              CareerMatch AI
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Resume-to-Job Match Analyzer
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      Upload Resume
                    </CardTitle>
                    <CardDescription>
                      Upload your latest resume in PDF or TXT format.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-10 h-10 mx-auto text-slate-400 mb-4" />
                      {file ? (
                        <div className="text-sm font-medium text-indigo-600">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Drag & drop your resume here, or click to select
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            PDF, TXT up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <Card className="shadow-sm border-slate-200 flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle className="w-5 h-5 text-indigo-500" />
                        Job Description
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleLoadDemo} className="text-xs">
                        Load Demo
                      </Button>
                    </div>
                    <CardDescription>
                      Paste the full job description you are applying for.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <Textarea
                      placeholder="Paste job description here..."
                      className="flex-1 min-h-[250px] resize-none focus-visible:ring-indigo-500"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing Match...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Compatibility
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
                  <p className="text-slate-500">Here's how your resume stacks up against the job description.</p>
                </div>
                <Button variant="outline" onClick={() => setResult(null)}>
                  New Analysis
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 shadow-sm border-slate-200 bg-gradient-to-br from-white to-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Match</CardTitle>
                    <CardDescription>AI-assisted heuristic score</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="#e2e8f0"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke={result.overallScore > 75 ? "#10b981" : result.overallScore > 50 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="8"
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * result.overallScore) / 100}
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 - (283 * result.overallScore) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-slate-800">{result.overallScore}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-center text-slate-500 px-4">
                      This is an AI estimate of compatibility, not a guarantee of hiring or ATS success.
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Match Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { label: "Skills Coverage", value: result.scores.skills },
                      { label: "Experience Alignment", value: result.scores.experience },
                      { label: "Project Relevance", value: result.scores.projects },
                      { label: "Keyword Optimization", value: result.scores.keywords },
                      { label: "Education Requirement", value: result.scores.education },
                    ].map((score, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-slate-700">{score.label}</span>
                          <span className="text-slate-900">{score.value}%</span>
                        </div>
                        <Progress value={score.value} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="skills" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-slate-100 rounded-xl">
                  <TabsTrigger value="skills" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Skills Match</TabsTrigger>
                  <TabsTrigger value="missing" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Missing Skills</TabsTrigger>
                  <TabsTrigger value="suggestions" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Suggestions</TabsTrigger>
                  <TabsTrigger value="interview" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Interview Prep</TabsTrigger>
                </TabsList>
                
                <TabsContent value="skills" className="mt-6">
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle>Skill Compatibility</CardTitle>
                      <CardDescription>How your skills map to the job requirements.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-700 flex items-center mb-3">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Strong Matches
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.skillsAnalysis.strongMatch.length > 0 ? (
                            result.skillsAnalysis.strongMatch.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">None found.</span>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-semibold text-amber-700 flex items-center mb-3">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Partial / Related Matches
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.skillsAnalysis.partialMatch.length > 0 ? (
                            result.skillsAnalysis.partialMatch.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">None found.</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="missing" className="mt-6">
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle>Missing Skills</CardTitle>
                      <CardDescription>Skills requested in the job description but not found in your resume.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-3">High Priority (Required)</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.skillsAnalysis.missingSkills.highPriority.length > 0 ? (
                            result.skillsAnalysis.missingSkills.highPriority.map((skill, i) => (
                              <Badge key={i} variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">Great! No critical skills missing.</span>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-semibold text-orange-700 mb-3">Medium Priority (Preferred)</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.skillsAnalysis.missingSkills.mediumPriority.length > 0 ? (
                            result.skillsAnalysis.missingSkills.mediumPriority.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No preferred skills missing.</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500">
                          <strong>Note:</strong> Just because a skill is not found in your resume doesn't mean you don't possess it. Consider updating your resume to include these keywords if you have the experience.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="suggestions" className="mt-6">
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle>Actionable Suggestions</CardTitle>
                      <CardDescription>AI-generated tips to improve your resume for this specific role.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {result.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex gap-3 text-slate-700 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="interview" className="mt-6">
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle>Interview Preparation</CardTitle>
                      <CardDescription>Topics and questions you might be asked based on the job description.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {result.interviewTopics.map((topic, i) => (
                          <li key={i} className="flex gap-3 text-slate-700">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                              {i + 1}
                            </div>
                            <span className="text-sm font-medium pt-1">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base">Extracted Resume Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px] pr-4">
                      <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
                        {JSON.stringify(result.extractedResume, null, 2)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base">Extracted Job Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px] pr-4">
                      <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
                        {JSON.stringify(result.extractedJob, null, 2)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
