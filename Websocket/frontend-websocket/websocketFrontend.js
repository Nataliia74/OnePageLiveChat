import { renderMessage, logOut } from "../frontend-polling/chat-polling.js";

const messageForm = document.getElementById("message_form");
const messageInput = document.getElementById("message");
const logoutButton = document.getElementById("logout");

const ws = new WebSocket(
  // "ws://localhost:3000",
  "ws://nataliia74-websocket-backend.hosting.codeyourfuture.io",
);

ws.addEventListener("open", () => {
  console.log("WebSocket connected!");
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.command === "init") {
    data.messages.forEach(renderMessage);
  }

  if (data.command === "new-message") {
    renderMessage(data.message);
  }
});

ws.addEventListener("close", () => {
  console.log("WebSocket disconnected");
});

ws.addEventListener("error", (err) => {
  console.error("WebSocket error", err);
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;

  ws.send(
    JSON.stringify({
      command: "send-message",
      message: {
        username: currentUser,
        text,
      },
    }),
  );

  messageInput.value = "";
});

logoutButton.addEventListener("click", logOut);
