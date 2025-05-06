import { GameAgent, LLMModel } from "@virtuals-protocol/game";
import { activityRecommenderWorker } from "./worker";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

dotenv.config();

if (!process.env.API_KEY) {
  throw new Error("API_KEY is required in environment variables");
}

export const activity_agent = new GameAgent(process.env.API_KEY, {
  name: "Activity Recommender",
  goal: "Help users find the perfect activities based on their location and current weather conditions",
  description:
    "You are an agent that gets location of the user and then uses that to get weather information and then uses that to recommend activities",
  workers: [activityRecommenderWorker],
  //   llmModel: LLMModel.DeepSeek_R1, // this is an optional paramenter to set the llm model for the agent. Default is Llama_3_1_405B_Instruct
});

export const arbitrage_agent = new GameAgent(process.env.API_KEY, {
  name: "Arbitrage Agent",
  goal: "Find arbitrage opportunities in the market for BTC/USD",
  description:
    "You are an agent that checks for arbitrage opportunities in the market for BTC/USD",
  workers: [activityRecommenderWorker],
  llmModel: LLMModel.DeepSeek_R1, // this is an optional paramenter to set the llm model for the agent. Default is Llama_3_1_405B_Instruct
});

async function updateAgentState(agent: GameAgent, message: string) {
  const state = await agent.getAgentState?.();
  //   agent.logger(message);
  console.log({ state, message });
}

/**
 * Extracts JSON from a string that starts with "Action State:"
 * @param input The input string that might contain JSON
 * @returns The parsed JSON object or null if no valid JSON is found
 */
export function extractActionStateJson(input: string): any {
  try {
    // Try to find JSON between triple backticks
    const tripleBackticksRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const tripleBackticksMatch = input.match(tripleBackticksRegex);

    if (tripleBackticksMatch && tripleBackticksMatch[1]) {
      try {
        return JSON.parse(tripleBackticksMatch[1]);
      } catch (e) {
        console.log(
          "Failed to parse JSON from triple backticks, trying to clean it up..."
        );
        // Try to clean up the JSON and parse again
        const cleanedJson = tripleBackticksMatch[1].replace(
          /[\u0000-\u001F\u007F-\u009F]/g,
          ""
        );
        return JSON.parse(cleanedJson);
      }
    }

    // Try to find JSON between single backticks
    const singleBackticksRegex = /`([\s\S]*?)`/;
    const singleBackticksMatch = input.match(singleBackticksRegex);

    if (singleBackticksMatch && singleBackticksMatch[1]) {
      try {
        return JSON.parse(singleBackticksMatch[1]);
      } catch (e) {
        console.log(
          "Failed to parse JSON from single backticks, trying to clean it up..."
        );
        // Try to clean up the JSON and parse again
        const cleanedJson = singleBackticksMatch[1].replace(
          /[\u0000-\u001F\u007F-\u009F]/g,
          ""
        );
        return JSON.parse(cleanedJson);
      }
    }

    // Try to find JSON with curly braces
    const curlyBracesRegex = /(\{[\s\S]*\})/;
    const curlyBracesMatch = input.match(curlyBracesRegex);

    if (curlyBracesMatch && curlyBracesMatch[1]) {
      try {
        return JSON.parse(curlyBracesMatch[1]);
      } catch (e) {
        console.log(
          "Failed to parse JSON from curly braces, trying to clean it up..."
        );
        // Try to find the last valid JSON object
        let jsonStr = curlyBracesMatch[1];
        let lastValidJson = null;

        // Try to find a valid JSON by removing characters from the end
        for (let i = jsonStr.length; i > 0; i--) {
          try {
            const truncatedJson = jsonStr.substring(0, i);
            if (truncatedJson.trim().endsWith("}")) {
              lastValidJson = JSON.parse(truncatedJson);
              break;
            }
          } catch (e) {
            // Continue trying
          }
        }

        if (lastValidJson) {
          return lastValidJson;
        }

        // If we still couldn't parse it, throw the original error
        throw e;
      }
    }

    // If we couldn't find any JSON, return null
    return null;
  } catch (error) {
    console.error("Error extracting JSON:", error);
    return null;
  }
}

export async function saveAgentStateToFile(agentState: any): Promise<void> {
  try {
    if (!agentState || Object.keys(agentState).length === 0) {
      console.log("No agent state to save");
      return;
    }

    // Save to file in the central data directory
    const filePath = path.join(__dirname, "../data/agentState.json");
    const dirPath = path.dirname(filePath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the agent state to the file
    fs.writeFileSync(filePath, JSON.stringify(agentState, null, 2));
    console.log(`Agent state saved to ${filePath}`);

    // Also send the agent state to the API server
    try {
      const apiUrl =
        process.env.API_URL || "http://localhost:3001/api/agent-state";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentState),
      });

      if (response.ok) {
        console.log("Agent state successfully sent to API server");
      } else {
        console.error(
          "Failed to send agent state to API server:",
          response.statusText
        );
      }
    } catch (apiError) {
      console.error("Error sending agent state to API server:", apiError);
      // Continue even if API call fails - we still have the file backup
    }
  } catch (error) {
    console.error("Error saving agent state:", error);
  }
}

arbitrage_agent.setLogger((agent: GameAgent, msg: string) => {
  console.log(` [${agent.name}]`);
  console.log(msg);
  console.log("------------------------\n");

  // Try to extract JSON from the message
  const actionState = extractActionStateJson(msg);
  if (actionState) {
    console.log("Found Action State JSON:", actionState);
    // Save the JSON to a file for the frontend
    saveAgentStateToFile(actionState);
  }

  updateAgentState(agent, msg);
});
