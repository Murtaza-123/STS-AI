import mongoose from "mongoose";
import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

const connectDatabase = async (): Promise<void> => {
  try {
    if (!process.env.DB_URL || !process.env.DB_NAME) {
      throw new Error(
        "Database configuration (DB_URL/DB_NAME) is missing in environment variables"
      );
    }

    await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);

    console.log(chalk.yellow(" 👉 STS_AI database connected successfully!"));
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDatabase;
