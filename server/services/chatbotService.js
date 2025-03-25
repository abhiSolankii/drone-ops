import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Mission from "../models/Mission.js";
import Drone from "../models/Drone.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use "gemini-1.5-pro" if you have access

export const chatbotHandler = async (socket, msg) => {
  const lowerMsg = msg.toLowerCase();
  let prompt = `
    You are a helpful assistant for a Drone Survey Management System. Respond to the user's query: "${msg}"
    You can:
    - Check mission status (e.g., "mission status <id>")
    - Check drone status (e.g., "drone status <id>")
    - Schedule a mission (e.g., "schedule mission <name> at <time>")
    - Provide help (e.g., "help")
    If the query involves a specific mission or drone, fetch data from the database if an ID is provided.
    Keep responses concise and actionable.
  `;

  try {
    // Extract ID if present
    const missionMatch = lowerMsg.match(/mission status (\w+)/);
    const droneMatch = lowerMsg.match(/drone status (\w+)/);
    const scheduleMatch = lowerMsg.match(/schedule mission (\w+) at (.+)/);

    if (missionMatch) {
      const missionId = missionMatch[1];
      const mission = await Mission.findById(missionId).populate(
        "assignedDrone"
      );
      prompt += mission
        ? `\nMission Data: ${JSON.stringify(mission.toObject())}`
        : `\nNo mission found with ID ${missionId}`;
    } else if (droneMatch) {
      const droneId = droneMatch[1];
      const drone = await Drone.findById(droneId);
      prompt += drone
        ? `\nDrone Data: ${JSON.stringify(drone.toObject())}`
        : `\nNo drone found with ID ${droneId}`;
    } else if (scheduleMatch) {
      const [_, name, time] = scheduleMatch;
      prompt += `\nSchedule a new mission named "${name}" at ${time}. Suggest a response to confirm scheduling.`;
    }

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    // If scheduling, actually create a mission (simplified)
    if (scheduleMatch) {
      const [_, name, time] = scheduleMatch;
      const newMission = new Mission({
        name,
        status: "planned",
        surveyArea: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
              [0, 0],
            ],
          ],
        },
        parameters: {
          altitude: 100,
          speed: 15,
          overlap: 75,
          pattern: "crosshatch",
        },
        schedule: { startTime: new Date(time), isRecurring: false },
      });
      await newMission.save();
    }

    socket.emit("chat-response", reply);
  } catch (error) {
    console.error("Chatbot error:", error);
    if (error.message.includes("quota")) {
      socket.emit(
        "chat-response",
        "Chatbot quota exceeded. Please try again later."
      );
    } else {
      socket.emit("chat-response", "Sorry, I encountered an error. Try again!");
    }
  }
};
