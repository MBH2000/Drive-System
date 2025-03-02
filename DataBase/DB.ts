
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
mongoose
  .connect(process.env.DB_URL as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));
