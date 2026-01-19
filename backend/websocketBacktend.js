import { messages } from "server.js";
import { server } from "server.js";
import { server as WebSocketServer } from "websocket";

const webSocketServer = new WebSocketServer({ httpServer: server });

const wbClients = new Set();

webSocketServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  wbClients.add(connection);

  connection.sendUTF(
    JSON.stringify({
      command: "send-message",
      messages,
    }),
  );

  connection.on("message", (message) => {
    if (message.type == "utf8") {
      const data = JSON.parse(message.utf8Data);
    }
    if (data.command == "send-message") {
      const newMessage = {
        message_id: messages.length + 1,
        username: data.message.username,
        text: data.message.text,
        timestamp: new Date().toISOString(),
      };
      messages.push(newMessage);

      wbClients.forEach((client) => {
        client.send(
          JSON.stringify({
            command: "new-message",
            message: newMessage,
          }),
        );
      });
    }
  });

  connection.on("close", () => {
    wbClients.delete(connection);
  });
});
