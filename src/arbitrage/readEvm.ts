import { EvmPriceServiceConnection, PriceFeed } from "@pythnetwork/pyth-evm-js";
import { ethers } from "ethers";

// Configuration
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const PYTH_CONTRACT_ADDRESS = "0xe9d69CdD6Fe41e7B621B4A688C5D1a68cB5c8ADc"; // Pyth contract on HyperEvm
const PRICE_FEED_ID =
  "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"; // BTC/USD feed ID on hyper-evm

const l1ReadAddress = "0x708545799825e9F725AA6c4F9674572503582b8a";

export async function runL1Read() {
  const abi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "delegations",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "validator",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "amount",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "lockedUntilTimestamp",
              type: "uint64",
            },
          ],
          internalType: "struct L1Read.Delegation[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "delegatorSummary",
      outputs: [
        {
          components: [
            {
              internalType: "uint64",
              name: "delegated",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "undelegated",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "totalPendingWithdrawal",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "nPendingWithdrawals",
              type: "uint64",
            },
          ],
          internalType: "struct L1Read.DelegatorSummary",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "l1BlockNumber",
      outputs: [
        {
          internalType: "uint64",
          name: "",
          type: "uint64",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "index",
          type: "uint32",
        },
      ],
      name: "markPx",
      outputs: [
        {
          internalType: "uint64",
          name: "",
          type: "uint64",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "index",
          type: "uint32",
        },
      ],
      name: "oraclePx",
      outputs: [
        {
          internalType: "uint64",
          name: "",
          type: "uint64",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "perp",
          type: "uint32",
        },
      ],
      name: "perpAssetInfo",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "coin",
              type: "string",
            },
            {
              internalType: "uint32",
              name: "marginTableId",
              type: "uint32",
            },
            {
              internalType: "uint8",
              name: "szDecimals",
              type: "uint8",
            },
            {
              internalType: "uint8",
              name: "maxLeverage",
              type: "uint8",
            },
            {
              internalType: "bool",
              name: "onlyIsolated",
              type: "bool",
            },
          ],
          internalType: "struct L1Read.PerpAssetInfo",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          internalType: "uint16",
          name: "perp",
          type: "uint16",
        },
      ],
      name: "position",
      outputs: [
        {
          components: [
            {
              internalType: "int64",
              name: "szi",
              type: "int64",
            },
            {
              internalType: "uint64",
              name: "entryNtl",
              type: "uint64",
            },
            {
              internalType: "int64",
              name: "isolatedRawUsd",
              type: "int64",
            },
            {
              internalType: "uint32",
              name: "leverage",
              type: "uint32",
            },
            {
              internalType: "bool",
              name: "isIsolated",
              type: "bool",
            },
          ],
          internalType: "struct L1Read.Position",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          internalType: "uint64",
          name: "token",
          type: "uint64",
        },
      ],
      name: "spotBalance",
      outputs: [
        {
          components: [
            {
              internalType: "uint64",
              name: "total",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "hold",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "entryNtl",
              type: "uint64",
            },
          ],
          internalType: "struct L1Read.SpotBalance",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "spot",
          type: "uint32",
        },
      ],
      name: "spotInfo",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint64[2]",
              name: "tokens",
              type: "uint64[2]",
            },
          ],
          internalType: "struct L1Read.SpotInfo",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "index",
          type: "uint32",
        },
      ],
      name: "spotPx",
      outputs: [
        {
          internalType: "uint64",
          name: "",
          type: "uint64",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "token",
          type: "uint32",
        },
      ],
      name: "tokenInfo",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint64[]",
              name: "spots",
              type: "uint64[]",
            },
            {
              internalType: "uint64",
              name: "deployerTradingFeeShare",
              type: "uint64",
            },
            {
              internalType: "address",
              name: "deployer",
              type: "address",
            },
            {
              internalType: "address",
              name: "evmContract",
              type: "address",
            },
            {
              internalType: "uint8",
              name: "szDecimals",
              type: "uint8",
            },
            {
              internalType: "uint8",
              name: "weiDecimals",
              type: "uint8",
            },
            {
              internalType: "int8",
              name: "evmExtraWeiDecimals",
              type: "int8",
            },
          ],
          internalType: "struct L1Read.TokenInfo",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          internalType: "address",
          name: "vault",
          type: "address",
        },
      ],
      name: "userVaultEquity",
      outputs: [
        {
          components: [
            {
              internalType: "uint64",
              name: "equity",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "lockedUntilTimestamp",
              type: "uint64",
            },
          ],
          internalType: "struct L1Read.UserVaultEquity",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "withdrawable",
      outputs: [
        {
          components: [
            {
              internalType: "uint64",
              name: "withdrawable",
              type: "uint64",
            },
          ],
          internalType: "struct L1Read.Withdrawable",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const l1Read = new ethers.Contract(l1ReadAddress, abi, provider);

  const spotInfo = await l1Read.spotPx(142);
  console.log("spotInfo: BTC/USD");

  //   const l1BlockNumber = await l1Read.l1BlockNumber();
  //   console.log("l1BlockNumber", l1BlockNumber);

  return Number(spotInfo / 1000);
}

// Main function to fetch price feed
export async function fetchPythPriceFeed() {
  try {
    // Initialize provider
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    // Initialize Pyth price service connection
    const connection = new EvmPriceServiceConnection(
      "https://hermes.pyth.network"
    ); // Pyth Hermes endpoint

    // epoch time 1 minute ago
    const currEpoch = Date.now();
    // Fetch price feed
    // const priceFeeds = await connection.getPriceFeed(
    //   PRICE_FEED_ID,
    //   epoch / 1000
    // );

    // Get the latest price
    const price: PriceFeed[] | undefined = await connection.getLatestPriceFeeds(
      [PRICE_FEED_ID]
    );

    if (!price) {
      throw new Error(`Price feed ${PRICE_FEED_ID} not found`);
    }

    // Extract price data
    const currentPrice = price?.[0].getPriceUnchecked();
    const formattedPrice =
      Number(currentPrice.price) * Math.pow(10, currentPrice.expo);
    // console.log("formattedPrice", formattedPrice);

    const priceOlderThan = price?.[0].getPriceNoOlderThan(60);

    if (!priceOlderThan?.publishTime) {
      throw new Error("Price feed not found");
    }
    // console.log("priceOlderThan", {
    //   currentEpoch: Math.floor(currEpoch / 1000),
    //   diff: Math.floor(currEpoch / 1000) - priceOlderThan.publishTime,
    //   price: priceOlderThan.price,
    //   publishedTime: priceOlderThan.publishTime,
    // });

    // console.log(price);

    return formattedPrice;
  } catch (error) {
    console.error("Error fetching Pyth price feed:", error);
    throw new Error("Error fetching Pyth price feed");
  }
}

// // Execute the function
// fetchPythPriceFeed();
// runL1Read();
