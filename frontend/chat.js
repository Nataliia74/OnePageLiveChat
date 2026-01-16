const messageForm = document.getElementById("message_form");
const message = document.getElementById("message");
const chatArea = document.getElementById("chat_box");
const logoutButton = document.getElementById("logout");

const currentUser = localStorage.getItem("username");

if (!currentUser) {
  window.location.href = "index.html";
}

const server = "https://live-chat-backend.hosting.codeyourfuture.io/messages";
const state = { messages: [] };

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

async function loadMessages() {
  try {
    const resp = await fetch(server);
    const messages = await resp.json();
    chatArea.innerHTML = "";

    state.messages = messages;
    messages.forEach(renderMessage);
  } catch (err) {
    console.log(`Failed to load messages`, err);
  }
}

async function sendMessage(text) {
  try {
    const resp = await fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, text: text }),
    });
    if (!resp.ok) {
      throw new Error("Message failed to be sent");
    }
    const message = await resp.json();
    state.messages.push(message);
    renderMessage(message);
  } catch (err) {
    console.log(err);
  }
}

async function keepFetchingLastMessages() {
  const lastMessageId =
    state.messages.length > 0
      ? state.messages[state.messages.length - 1].message_id
      : null;
  const query = lastMessageId ? `?since=${lastMessageId}` : "";
  const url = `${server}${query}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();

    let newMessages = data.filter(
      (msg) =>
        !state.messages.some(
          (existing) => existing.message_id === msg.message_id
        )
    );
    state.messages.push(...newMessages);
    newMessages.forEach(renderMessage);
  } catch (err) {
    console.log(err);
  } finally {
    setTimeout(keepFetchingLastMessages, 5000);
  }
}

messageForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = message.value.trim();
  if (!text) return;
  sendMessage(text);
  message.value = "";
});

message.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    messageForm.requestSubmit();
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

loadMessages().then(() => {
  keepFetchingLastMessages();
});
