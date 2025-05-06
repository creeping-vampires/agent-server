import { GameWorker } from "@virtuals-protocol/game";
import {
  getWeatherFunction,
  getLocationFunction,
  recommendActivitiesFunction,
  arbitrageFunction,
} from "./functions";

// Create a demo worker with our functions
export const activityRecommenderWorker = new GameWorker({
  id: "activity_recommender",
  name: "Activity Recommender",
  description: "Show arbitrage opportunities in market",
  functions: [arbitrageFunction],
});
