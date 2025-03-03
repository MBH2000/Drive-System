import express, { Application, response } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import "./dataBase/DB";

// Load environment variables
dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const port = process.env.PORT || 8000;
const server = http.createServer(app);
