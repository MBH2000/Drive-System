import express, { Application, response } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import "./dataBase/DB";
import Userouter from "./routers/userRouter";
import Folderrouter from "./routers/folderRouter";
import Filerouter from "./routers/fileRouter";
import { ExpressPeerServer } from "peer";

// Load environment variables
dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/user", Userouter);
app.use("/folder", Folderrouter);
app.use("/file", Filerouter);

const port = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log("server running at http://localhost:", port);
});

const peerServer = ExpressPeerServer(server, { path: "/myapp" });
app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  const clientId = client.getId();
  console.log("New connection:", clientId);
});

peerServer.on("disconnect", (client) => {
  const clientId = client.getId();
  console.log("Peer disconnected:", clientId);
});
