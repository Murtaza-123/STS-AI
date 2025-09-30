import OpenAI from "openai";
import { ENV } from "./env";

if (!ENV.OPENAI_API_KEY) {
  throw new Error(
    "Missing OPENAI_API_KEY. Set it in your environment or .env file."
  );
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});
