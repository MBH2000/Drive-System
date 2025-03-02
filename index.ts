import express, { Application, response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import "./DataBase/DB";

// Load environment variables
dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const port = process.env.PORT || 8000;
const server = http.createServer(app);

// MongoDB Connection
mongoose
  .connect(process.env.DB_URL as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));
