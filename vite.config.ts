import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WebSocketServer } from "ws";

function copyPyodidePlugin() {
  return {
    name: "copy-pyodide-assets",
    closeBundle() {
      const source = join(process.cwd(), "node_modules", "pyodide");
      const target = join(process.cwd(), "dist", "pyodide");
      if (!existsSync(source)) return;
      mkdirSync(target, { recursive: true });
      for (const file of readdirSync(source)) {
        if (/\.(js|wasm|data|json|zip)$/.test(file)) {
          copyFileSync(join(source, file), join(target, file));
        }
      }
    }
  };
}

function websocketPlugin() {
  return {
    name: "websocket-server",
    configureServer(server) {
      const wss = new WebSocketServer({ noServer: true });

      server.httpServer?.on("upgrade", (request, socket, head) => {
        const url = new URL(request.url || "", `http://${request.headers.host}`);
        if (url.pathname === "/ws-multiplayer") {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
          });
        }
      });

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
    }
  };
}

export default defineConfig({
  plugins: [react(), copyPyodidePlugin(), websocketPlugin()],
  server: {
    port: 5173
  }
});
