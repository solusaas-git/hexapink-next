import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId as string);
      console.log(`User ${userId} joined their room`);
    }

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.to(userId).emit(event, data);
};

export const broadcastToAll = (event: string, data: any) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.emit(event, data);
};

