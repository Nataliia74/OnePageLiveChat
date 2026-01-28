import express from "express";
import cors from "cors";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;
//
const allowedOrigins = [
  "https://nataliia74-websocket-frontend-pollingpart.hosting.codeyourfuture.io",
  "https://nataliia74-websocketapp-frontend-websocketconnection4.hosting.codeyourfuture.io",
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server tools / curl (no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static frontends
app.use(
  "/polling",
  express.static(path.join(__dirname, "../frontend-polling")),
);

app.use(
  "/websocket",
  express.static(path.join(__dirname, "../frontend-websocket")),
);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let messages = [
  {
    message_id: 1,
    username: "Sara",
    text: "hello",
    timestamp: new Date(2025, 5, 7).toISOString(),
  },
  {
    message_id: 2,
    username: "Sonya",
    text: "hi",
    timestamp: new Date(2025, 9, 23).toISOString(),
  },
];

let callbacksForNewMessages = [];

app.get("/messages", (req, resp) => {
  const sinceId = Number(req.query.sinceId);

  if (req.query.sinceId !== undefined && isNaN(sinceId)) {
    return resp.status(400).json({ error: "Invalid since format" });
  }
  const newMessages = messages.filter(
    (msg) => !sinceId || msg.message_id > sinceId,
  );
  if (newMessages.length > 0) {
    resp.json(newMessages);
  } else {
    callbacksForNewMessages.push((newMessages) => resp.json(newMessages));
  }
});

app.post("/messages", (req, resp) => {
  const { username, text } = req.body;
  if (!username || !text) {
    return resp.status(400).json({ error: "Missing username or text message" });
  }
  const newMessage = {
    message_id: messages.length + 1,
    username,
    text,
    timestamp: new Date().toISOString(),
  };
  messages.push(newMessage);

  console.log("Messages in memory:", messages);

  while (callbacksForNewMessages.length > 0) {
    const callback = callbacksForNewMessages.pop();
    callback([newMessage]);
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          command: "new-message",
          message: newMessage,
        }),
      );
    }
  });

  resp.status(200).json(newMessage);
});

wss.on("connection", (ws) => {
  console.log("Client connected to Websocket!");

  ws.send(
    JSON.stringify({
      command: "init",
      messages,
    }),
  );

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (err) {
      console.warn("Invalid JSON from client:", message.toString());
      return;
    }

    if (data.command === "send-message") {
      const newMessage = {
        message_id: messages.length + 1,
        username: data.message.username,
        text: data.message.text,
        timestamp: new Date().toISOString(),
      };

      messages.push(newMessage);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              command: "new-message",
              message: newMessage,
            }),
          );
        }
      });

      while (callbacksForNewMessages.length > 0) {
        const callback = callbacksForNewMessages.pop();
        callback([newMessage]);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from Websocket!");
  });
});

server.listen(port, () => {
  console.log(`Server listen on ${port}`);
});
