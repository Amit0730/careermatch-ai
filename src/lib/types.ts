export interface AnalysisResult {
  overallScore: number;
  scores: {
    skills: number;
    experience: number;
    projects: number;
    keywords: number;
    education: number;
  };
  skillsAnalysis: {
    strongMatch: string[];
    partialMatch: string[];
    missingSkills: {
      highPriority: string[];
      mediumPriority: string[];
    };
  };
  extractedResume: {
    contact: any;
    skills: string[];
    experience: any[];
    education: any[];
    projects: any[];
  };
  extractedJob: {
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    keywords: string[];
  };
  suggestions: string[];
  interviewTopics: string[];
}
