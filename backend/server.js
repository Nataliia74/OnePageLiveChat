import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

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

  if (sinceId && isNaN(sinceId)) {
    return resp.status(400).json({ error: "Invalid since format" });
  }
  const newMessages = messages.filter(
    (msg) => !sinceId || msg.message_id > sinceId
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
    message_id: messages.length++,
    username,
    text,
    timestamp: new Date().toISOString(),
  };
  messages.push(newMessage);
  while (callbacksForNewMessages.length > 0) {
    const callback = callbacksForNewMessages.pop();
    callback([newMessage]);
  }
  resp.status(200).json(newMessage);
});

app.listen(port, () => {
  console.log(`Server listen on ${port}`);
});
