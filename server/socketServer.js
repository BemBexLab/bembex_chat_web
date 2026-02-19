const { Server } = require("socket.io");

let io;

function broadcastMessage(data) {
  if (!io || !data?.conversationId) return;

  io.to(data.conversationId).emit("new_message", data);

  const participantIds = new Set();
  if (data.senderId) participantIds.add(String(data.senderId));
  if (data.receiverId) participantIds.add(String(data.receiverId));

  // Fallback: derive participants from conversationId so delivery does not rely on payload fields.
  const parts = String(data.conversationId).split("-");
  if (parts.length === 2) {
    participantIds.add(parts[0]);
    participantIds.add(parts[1]);
  }

  for (const userId of participantIds) {
    io.to(userId).except(data.conversationId).emit("new_message", data);
  }
}

function setupSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      socket.on("identify", ({ id, type }) => {
        if (!id) return;
        socket.data.userId = String(id);
        socket.data.userType = type;
        socket.join(String(id));
      });

      socket.on("join", (room) => {
        if (!room) return;
        socket.join(String(room));
      });

      socket.on("leave", (room) => {
        if (!room) return;
        socket.leave(String(room));
      });

      socket.on("new_message", (data) => {
        broadcastMessage(data);
      });
    });
  }

  global.__io = io;
  return io;
}

module.exports = { setupSocket };
