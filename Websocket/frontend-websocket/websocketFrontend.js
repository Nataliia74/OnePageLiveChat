const messageForm = document.getElementById("message_form");
const messageInput = document.getElementById("message");
const logoutButton = document.getElementById("logout");
const chatArea = document.getElementById("chat_box");

const currentUser = localStorage.getItem("username");

if (!currentUser) {
  window.location.href = "index.html";
}

function userNearThreshold() {
  const threshold = 50;
  const actualPosition =
    chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight;
  if (Math.abs(actualPosition) < threshold) {
    return true;
  }
  return false;
}

function renderMessage(msg) {
  const scroll = userNearThreshold();
  const messageInChatBox = document.createElement("div");
  messageInChatBox.className = "chat_messages";
  messageInChatBox.innerText = `${msg.username}: ${msg.text}`;

  chatArea.appendChild(messageInChatBox);

  if (scroll) {
    chatArea.scrollTop = chatArea.scrollHeight;
  }
}

export function logOut() {
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

const ws = new WebSocket(
  // "ws://localhost:3000",
  "wss://nataliia74-websocket-backend.hosting.codeyourfuture.io",
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

  console.log("WS readyState:", ws.readyState); // 0 connecting, 1 open, 2 closing, 3 closed

  if (ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket not open, cannot send");
    return;
  }

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
