import mongoose from "mongoose";
import { LogDebug, LogError } from "../utils/handling/logging";

export async function Connect(uri: string) {
  try {
    await mongoose.connect(uri);
    LogDebug("Connected to MongoDB");
  } catch (error) {
    LogError(error);
  }
}
