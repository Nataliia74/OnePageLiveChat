const messageForm = document.getElementById("message_form");
const message = document.getElementById("message");
const chatArea = document.getElementById("chat_box");

function renderMessage(msg) {
  const messageInChatBox = document.createElement("div");
  messageInChatBox.className = "chat_messages";
  messageInChatBox.innerText = `${msg.username}: ${msg.text}`;

  chatArea.appendChild(messageInChatBox);
  chatArea.scrollTop = chatArea.scrollHeight;
}

async function loadMessages() {
  try {
    const resp = await fetch("http://localhost:3000/messages");
    const messages = await resp.json();
    chatArea.innerHTML = "";
    messages.forEach(renderMessage);
  } catch (err) {
    console.log(`Failed to load messages`, err);
  }
}

const currentUser = "Sara";
const server = "http://localhost:300";
const state = { messages: [] };

async function sendMessage(text) {
  try {
    const resp = await fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, text: text }),
    });
    if (!resp.ok) {
      throw new Error("Message failed to be sent");
    }
    const message = await resp.json();
    renderMessage(message);
  } catch (err) {
    console.log(err);
  }
}

const lastMessage = async function keepFetchingLastMessages() {
  const lastMessageTimeStamp =
    state.messages.length > 0
      ? state.messages[state.messages.length - 1].timestamp
      : null;
  const query = lastMessageTimeStamp ? `?since=${lastMessageTimeStamp}` : "";
  const url = `${server}/messages${query}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    state.messages.push(...data);
    data.forEach(renderMessage);
  } catch (err) {
    console.log(err);
  }
  setTimeout(lastMessage, 1000);
};

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
    // messageForm.submit();
    messageForm.requestSubmit();
  }
});

loadMessages();
