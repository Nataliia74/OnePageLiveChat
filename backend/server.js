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
    time: "22.05.2025",
  },
  {
    message_id: 2,
    username: "Sonya",
    text: "hi",
    time: "23.09.2025",
  },
];

app.get("/messages", (req, resp) => {
  resp.json(messages);
});

app.post("/messages", (req, resp) => {
  const { username, text } = req.body;
  if (!username || !text) {
    return resp.status(400).json({ error: "Missing username or text message" });
  }
  const message = {
    message_id: messages.length + 1,
    username,
    text,
    time: new Date().toISOString(),
  };
  messages.push(message);
  resp.status(200).json(message);
});

app.listen(port, () => {
  console.log(`Server listen on ${port}`);
});
