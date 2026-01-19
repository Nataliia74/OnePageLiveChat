import { renderMessage, logOut } from "chat.js";

const wsURL = "ws://127.0.0.1:3000";

let websocket = null;

function initializeWebSocketListeners(ws) {
  websocket = new WebSocket(wsURL);
  ws.addEventListener("open", () => {
    console.log("Websocket connected!");
  });

  ws.addEventListener("close", () => {
    console.log("Websocket disconnected!");
  });

  ws.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    if (data.command == "init") {
      data.messages.forEach(renderMessage);
    } else if (data.command == "new-message") {
      renderMessage(data.message);
    }
  });

  ws.addEventListener("error", (e) => {
    console.log(`Websocket error`, e);
  });
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    websocket = new WebSocket(wsURL);
    initializeWebSocketListeners(websocket);
  }
});

initializeWebSocketListeners(websocket);

const messageForm = document.getElementById("message_form");
const message = document.getElementById("message");
document.getElementById("logout").addEventListener("click", logOut);

messageForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = message.value.trim();
  if (!text) return;

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(
      JSON.stringify({
        command: "send-message",
        message: {
          username: localStorage.getItem("username"),
          text,
        },
      }),
    );
  }

  messageInput.value = "";
});
