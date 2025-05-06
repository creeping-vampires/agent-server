import { arbitrage_agent } from "./agent";

async function main() {
  try {
    // Initialize the agent
    await arbitrage_agent.init();

    // Run the agent
    console.log("Starting arbitrage agent...");
    while (true) {
      await arbitrage_agent.step({ verbose: true });

      // Add a small delay between steps to avoid high CPU usage
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error("Error running arbitrage agent:", error);
  }
}

main();
