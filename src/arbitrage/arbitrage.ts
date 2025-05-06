import axios from "axios";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { fetchPythPriceFeed, runL1Read } from "./readEvm";

// Load environment variables
dotenv.config();

// Pyth Oracle ABI - Only the functions we need
const pythOracleAbi = [
  "function getPrice(string calldata symbol) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime)",
];

// Configuration
const MONITORING_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const BTC_SYMBOL = "bitcoin";
const PYTH_BTC_SYMBOL = "BTC/USD";
const THRESHOLD_PERCENTAGE = 0.5; // 0.5% price difference to alert

// HYPE EVM RPC URL and Pyth Oracle contract address
// Replace with actual values
const HYPE_EVM_RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const PYTH_ORACLE_ADDRESS = "0xe9d69CdD6Fe41e7B621B4A688C5D1a68cB5c8ADc"; // Replace with actual address

/**
 * Get BTC price from CoinGecko API
 * @returns Promise with BTC price in USD
 */
async function getBtcPriceFromCoinGecko(): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${BTC_SYMBOL}&vs_currencies=usd`
    );

    if (
      !response.data ||
      !response.data[BTC_SYMBOL] ||
      !response.data[BTC_SYMBOL].usd
    ) {
      throw new Error("Invalid response from CoinGecko API");
    }

    const price = response.data[BTC_SYMBOL].usd;
    console.log(`CoinGecko BTC Price: $${price}`);
    return price;
  } catch (error) {
    console.error("Error fetching price from CoinGecko:", error);
    throw error;
  }
}

/**
 * Get BTC price from Pyth Oracle on HYPE EVM
 * @returns Promise with BTC price in USD
 */
async function getBtcPriceFromPythOracle(): Promise<number> {
  try {
    // Connect to HYPE EVM
    const provider = new ethers.providers.JsonRpcProvider(HYPE_EVM_RPC_URL);

    // Create contract instance
    const pythOracleContract = new ethers.Contract(
      PYTH_ORACLE_ADDRESS,
      pythOracleAbi,
      provider
    );

    // Get price from Pyth Oracle
    const [price, conf, expo, publishTime] =
      await pythOracleContract.getPrice(PYTH_BTC_SYMBOL);

    // Convert price to USD based on exponent
    // Pyth prices are stored as fixed-point numbers with the exponent specified
    const priceInUsd = Number(price) * Math.pow(10, Number(expo));

    console.log(`Pyth Oracle BTC Price: $${priceInUsd}`);
    console.log(
      `Last updated: ${new Date(Number(publishTime) * 1000).toISOString()}`
    );

    return priceInUsd;
  } catch (error) {
    console.error("Error fetching price from Pyth Oracle:", error);
    throw error;
  }
}

/**
 * Check for arbitrage opportunities between CoinGecko and Pyth Oracle
 */
export async function checkArbitrageOpportunity(): Promise<
  [number, number, number, number]
> {
  try {
    // Get prices from both sources
    const [l1Price, pythOraclePrice] = await Promise.all([
      runL1Read(),
      fetchPythPriceFeed(),
    ]);

    console.log("l1Price", l1Price);
    console.log("pythOraclePrice", pythOraclePrice);

    // Calculate price difference percentage
    const priceDifference = Math.abs(Number(l1Price) - Number(pythOraclePrice));
    const priceDifferencePercentage = (priceDifference / Number(l1Price)) * 100;

    console.log(
      `Price difference: $${priceDifference.toFixed(
        2
      )} (${priceDifferencePercentage.toFixed(2)}%)`
    );

    // Check if the difference exceeds the threshold
    if (priceDifferencePercentage > THRESHOLD_PERCENTAGE) {
      console.log(" ARBITRAGE OPPORTUNITY DETECTED ");
      console.log(
        `Buy from ${
          Number(l1Price) < Number(pythOraclePrice) ? "L1" : "Pyth Oracle"
        }`
      );
      console.log(
        `Sell on ${
          Number(l1Price) > Number(pythOraclePrice) ? "L1" : "Pyth Oracle"
        }`
      );
      console.log(`Potential profit per BTC: $${priceDifference.toFixed(2)}`);
    } else {
      console.log("No significant arbitrage opportunity at the moment");
    }

    console.log("---------------------------------------------------");
    return [
      l1Price,
      pythOraclePrice,
      priceDifference,
      priceDifferencePercentage,
    ];
  } catch (error) {
    console.error("Error checking arbitrage opportunity:", error);
    return [0, 0, 0, 0];
  }
}

/**
 * Main function to start monitoring
 */
// async function startMonitoring(): Promise<void> {
//   console.log(
//     "Starting BTC arbitrage monitoring between HyperLiquid L1 Pre Reads and HYPE EVM Pyth Oracle"
//   );
//   console.log(
//     `Monitoring interval: ${MONITORING_INTERVAL_MS / 1000 / 60} minutes`
//   );
//   console.log(`Alert threshold: ${THRESHOLD_PERCENTAGE}%`);
//   console.log("---------------------------------------------------");

//   // Initial check
//   await checkArbitrageOpportunity();

//   // Set up interval for regular checks
//   setInterval(checkArbitrageOpportunity, MONITORING_INTERVAL_MS);
// }

// // Start the monitoring process
// (async () => {
//   try {
//     await startMonitoring();
//   } catch (error) {
//     console.error("Fatal error in arbitrage monitoring:", error);
//   }
// })();
