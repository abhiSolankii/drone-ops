import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Optimize survey path using Gemini
export const optimizeSurveyPath = async (surveyArea, parameters) => {
  console.log(parameters);
  const { pattern, altitude, speed, overlap } = parameters;
  const prompt = `
    Given a survey area with coordinates ${JSON.stringify(
      surveyArea.coordinates
    )},
    optimize the flight path for a drone survey with the following parameters:
    - Pattern: ${pattern}
    - Altitude: ${altitude}m
    - Speed: ${speed}m/s
    - Overlap: ${overlap}%
    Return the optimized coordinates as a JSON object with a "coordinates" key, ensuring the path maximizes coverage efficiency. Provide only the JSON object, no additional text or code.
  `;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    // Clean Markdown code block markers and any unexpected text
    const cleanedText = rawText
      .replace(/```json\n?/, "") // Remove ```json and optional newline
      .replace(/```/, "") // Remove closing ```
      .replace(/.*?({.*}).*/s, "$1") // Extract the first JSON object, ignore surrounding text
      .trim();
    const optimizedPath = JSON.parse(cleanedText);
    if (!optimizedPath.coordinates) {
      throw new Error("No coordinates found in optimized path");
    }
    return { coordinates: optimizedPath.coordinates };
  } catch (error) {
    console.error("Gemini path optimization error:", error);
    if (error.message.includes("quota")) {
      console.warn(
        "Gemini API quota exceeded, returning original coordinates."
      );
    }
    return { coordinates: surveyArea.coordinates };
  }
};

// Generate survey report using Gemini
export const generateSurveyReport = async (mission, analysisResults) => {
  const prompt = `
    Generate a detailed survey report for a drone mission:
    - Mission Name: ${mission.name}
    - Status: ${mission.status}
    - Survey Area: ${JSON.stringify(mission.surveyArea.coordinates)}
    - Parameters: Altitude ${mission.parameters.altitude}m, Speed ${
    mission.parameters.speed
  }m/s, Overlap ${mission.parameters.overlap}%, Pattern ${
    mission.parameters.pattern
  }
    - Assigned Drone: ${mission.assignedDrone?.name || "N/A"}
    - Progress: ${mission.progress}%
    - Start Time: ${mission.schedule.startTime}
    - End Time: ${mission.updatedAt}
    - Analysis Results: ${JSON.stringify(analysisResults)}
    Provide a summary (200-300 words) analyzing the mission performance, coverage, and any insights from the analysis results. Return the summary as a JSON object with a "summary" key.
  `;

  try {
    const result = await model.generateContent(prompt);
    const report = JSON.parse(result.response.text());
    return report.summary
      ? { summary: report.summary }
      : { summary: "Report generation failed" };
  } catch (error) {
    console.error("Gemini report generation error:", error);
    if (error.message.includes("quota")) {
      console.warn("Gemini API quota exceeded, returning fallback summary.");
    }
    return {
      summary: `Mission "${mission.name}" completed. No detailed analysis available due to an error.`,
    };
  }
};

// Mock analyzeImage (since image collection is out of scope)
export const analyzeImage = async (image) => {
  return {
    objects: ["tree", "building"],
    confidence: 0.9,
  };
};
