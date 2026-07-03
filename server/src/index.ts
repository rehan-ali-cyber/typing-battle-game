import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// CORS configuration
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Basic health check route
app.get("/", (req, res) => {
  res.json({ message: "Typing Battle Arena API is running smoothly!" });
});

// Create HTTP server wrapping Express
const server = createServer(app);

// WebSocket Server for Multiplayer duels
const wss = new WebSocketServer({ noServer: true });

// Keep track of rooms: roomId -> list of connections
const rooms = new Map<string, Array<{ ws: any; name: string }>>();

wss.on("connection", (ws) => {
  let currentRoomId: string | null = null;
  let currentName: string | null = null;

  ws.on("message", (messageStr) => {
    try {
      const data = JSON.parse(messageStr.toString());
      if (data.type === "join") {
        const { roomId, name } = data;
        currentRoomId = roomId;
        currentName = name;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, []);
        }
        const clients = rooms.get(roomId)!;

        if (clients.length >= 2) {
          ws.send(JSON.stringify({ type: "error", message: "Room is full!" }));
          return;
        }

        clients.push({ ws, name });
        
        // Notify other player that someone joined
        clients.forEach((client) => {
          if (client.ws !== ws) {
            client.ws.send(JSON.stringify({ type: "opponent-joined", name }));
          }
        });

        // If room has 2 players, start the match!
        if (clients.length === 2) {
          const player1 = clients[0].name;
          const player2 = clients[1].name;
          clients[0].ws.send(JSON.stringify({ type: "match-start", role: "player1", opponentName: player2 }));
          clients[1].ws.send(JSON.stringify({ type: "match-start", role: "player2", opponentName: player1 }));
        }
      } else if (data.type === "game-event") {
        // Relay events to the opponent in the same room
        if (currentRoomId) {
          const clients = rooms.get(currentRoomId);
          if (clients) {
            clients.forEach((client) => {
              if (client.ws !== ws) {
                client.ws.send(JSON.stringify(data));
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("WS Message Error:", err);
    }
  });

  ws.on("close", () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      let clients = rooms.get(currentRoomId)!;
      clients = clients.filter((client) => client.ws !== ws);
      if (clients.length === 0) {
        rooms.delete(currentRoomId);
      } else {
        rooms.set(currentRoomId, clients);
        // Notify opponent of disconnection
        clients.forEach((client) => {
          client.ws.send(JSON.stringify({ type: "opponent-left" }));
        });
      }
    }
  });
});

// Upgrade HTTP server connections to WebSockets on /ws-multiplayer
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  if (url.pathname === "/ws-multiplayer") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Typing Battle Arena Server running on port ${PORT}`);
  console.log(`👉 Frontend URL: ${FRONTEND_URL}`);
});
