import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Using response schema to enforce the JSON structure
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, description: "Overall match score from 0 to 100" },
    scores: {
      type: Type.OBJECT,
      properties: {
        skills: { type: Type.INTEGER },
        experience: { type: Type.INTEGER },
        projects: { type: Type.INTEGER },
        keywords: { type: Type.INTEGER },
        education: { type: Type.INTEGER },
      },
      required: ["skills", "experience", "projects", "keywords", "education"],
    },
    skillsAnalysis: {
      type: Type.OBJECT,
      properties: {
        strongMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
        partialMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingSkills: {
          type: Type.OBJECT,
          properties: {
            highPriority: { type: Type.ARRAY, items: { type: Type.STRING } },
            mediumPriority: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["highPriority", "mediumPriority"],
        },
      },
      required: ["strongMatch", "partialMatch", "missingSkills"],
    },
    extractedResume: {
      type: Type.OBJECT,
      properties: {
        contact: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, nullable: true },
            email: { type: Type.STRING, nullable: true },
            phone: { type: Type.STRING, nullable: true },
            location: { type: Type.STRING, nullable: true },
            links: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              jobTitle: { type: Type.STRING },
              company: { type: Type.STRING },
              dates: { type: Type.STRING },
              responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              degree: { type: Type.STRING },
              institution: { type: Type.STRING },
              dates: { type: Type.STRING },
            },
          },
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
            },
          },
        },
      },
      required: ["contact", "skills", "experience", "education", "projects"],
    },
    extractedJob: {
      type: Type.OBJECT,
      properties: {
        requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["requiredSkills", "preferredSkills", "responsibilities", "keywords"],
    },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    interviewTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "overallScore",
    "scores",
    "skillsAnalysis",
    "extractedResume",
    "extractedJob",
    "suggestions",
    "interviewTopics",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    if (!file || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resume file or job description" },
        { status: 400 }
      );
    }

    // Extract text from resume
    let resumeText = "";
    if (file.name.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else if (file.name.endsWith(".txt")) {
      resumeText = await file.text();
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a PDF or TXT file." },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert ATS (Applicant Tracking System) and technical recruiter.
      Analyze the provided Resume and Job Description.
      
      Job Description:
      ${jobDescription}
      
      Resume:
      ${resumeText}
      
      Task: Provide a detailed matching analysis including structured data extraction, skill comparison, scores out of 100, improvement suggestions, and potential interview topics based on the job requirements.
      Do not claim a 100% chance of hiring. Ensure transparency that this is an AI-assisted heuristic. Do not invent missing skills if they are present. Only categorize skills missing from the resume as missing skills.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for more factual analysis
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response generated from AI.");
    }

    const analysisResult = JSON.parse(textResult);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis. Please try again." },
      { status: 500 }
    );
  }
}
