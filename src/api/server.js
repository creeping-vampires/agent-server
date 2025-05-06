const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Define the data directory and file path
const DATA_DIR = path.join(__dirname, "../../data");
const AGENT_STATE_FILE = path.join(DATA_DIR, "agentState.json");

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory at ${DATA_DIR}`);
}

// Initialize with empty agent state if file doesn't exist
if (!fs.existsSync(AGENT_STATE_FILE)) {
  const initialState = {
    hlp: {
      plan_id: "",
      observation_reflection: "",
      plan: [],
      plan_reasoning: "",
      change_indicator: null,
      log: [],
      current_state_of_execution: "",
    },
    current_task: {
      task_id: "",
      task: "",
      location_id: "",
      task_reasoning: "",
      llp: {
        plan_id: "",
        plan_reasoning: "",
        situation_analysis: "",
        plan: [],
        reflection: "",
        change_indicator: "",
      },
      task_result: null,
    },
  };
  fs.writeFileSync(AGENT_STATE_FILE, JSON.stringify(initialState, null, 2));
  console.log(`Initialized agent state file at ${AGENT_STATE_FILE}`);
}

// API endpoint to get the agent state
app.get("/api/agent-state", (req, res) => {
  try {
    // Check if the file exists
    if (!fs.existsSync(AGENT_STATE_FILE)) {
      return res.status(404).json({ error: "Agent state file not found" });
    }

    // Read the file
    const agentStateData = fs.readFileSync(AGENT_STATE_FILE, "utf-8");

    // Parse the JSON
    const agentState = JSON.parse(agentStateData);

    // Return the agent state
    return res.json(agentState);
  } catch (error) {
    console.error("Error reading agent state:", error);
    return res.status(500).json({ error: "Failed to read agent state" });
  }
});

// API endpoint to update the agent state
app.post("/api/agent-state", (req, res) => {
  try {
    // Get the new agent state from the request body
    const newAgentState = req.body;

    // Write the new agent state to the file
    fs.writeFileSync(AGENT_STATE_FILE, JSON.stringify(newAgentState, null, 2));
    console.log(`Updated agent state at ${AGENT_STATE_FILE}`);

    // Return success
    return res.json({ success: true });
  } catch (error) {
    console.error("Error updating agent state:", error);
    return res.status(500).json({ error: "Failed to update agent state" });
  }
});

// Start the server
function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
  return server;
}

// If this file is run directly, start the server
if (require.main === module) {
  startServer();
}

module.exports = { startServer, app };
