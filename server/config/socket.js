import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Chat from "../model/ChatModel.js";
import Message from "../model/MessagesModel.js";
import User from "../model/UserModel.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const setupSocket = (server) => {
  let pubClient;
  let userSocketMap = new Map(); // Map to track all socket IDs for a given user ID

  // Attach Socket.IO to the Express server
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: [process.env.CLIENT_URL || "https://synk-app-wine.vercel.app"],
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  if (process.env.REDIS_URL) {
    pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Socket.IO connected to Redis adapter");
      })
      .catch((err) => {
        console.error(
          "Could not connect to Redis adapter. Socket.IO will run on a single instance.",
          err
        );
      });
  } else {
    console.log(
      "Socket.IO is running without Redis adapter (not horizontally scalable)."
    );
  }

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`Socket connected: ${socket.id} for user ${socket.userId}`);

    const user = await User.findById(socket.userId).select("username");
    console.log(`${user.username} (${user._id}) connected.`);

    // Add the new socket ID to the user's list of sockets
    if (!userSocketMap.has(socket.userId)) {
      userSocketMap.set(socket.userId, new Set());
    }
    userSocketMap.get(socket.userId).add(socket.id);

    // Set user to online in Redis or DB only if it's their first active connection
    if (userSocketMap.get(socket.userId).size === 1) {
      if (pubClient?.isReady) {
        await pubClient.sAdd("online_users", socket.userId);
        socket.broadcast.emit("user online", { userId: socket.userId });
      } else {
        await User.findByIdAndUpdate(socket.userId, { isOnline: true });
      }
    }

    socket.emit("connected");

    socket.on("join chat", (chatId) => {
      socket.join(chatId);
      console.log(`Socket joined chat: ${chatId}`);
    });

    socket.on("leave chat", (chatId) => {
      socket.leave(chatId);
      console.log(`Socket left chat: ${chatId}`);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", async (messageData) => {
      const { chatId, content } = messageData;

      if (!chatId || !content) {
        console.error("Invalid data passed for new message event");
        return;
      }

      const newMessage = {
        sender: socket.userId,
        content: content,
        chat: chatId,
      };

      try {
        let message = await Message.create(newMessage);

        message = await message.populate("sender", "username avatar");
        message = await message.populate("chat");
        message = await User.populate(message, {
          path: "chat.users",
          select: "username avatar email",
        });

        await Chat.findByIdAndUpdate(chatId, {
          latestMessage: message,
        });

        io.in(chatId).emit("message received", message);
      } catch (error) {
        console.error("Error handling new message:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(
        `Socket disconnected: ${socket.id} for user ${socket.userId}`
      );
      if (socket.userId) {
        userSocketMap.get(socket.userId)?.delete(socket.id);

        if (userSocketMap.get(socket.userId)?.size === 0) {
          userSocketMap.delete(socket.userId);
          if (pubClient?.isReady) {
            await pubClient.sRem("online_users", socket.userId);
            socket.broadcast.emit("user offline", { userId: socket.userId });
          } else {
            await User.findByIdAndUpdate(socket.userId, { isOnline: false });
          }
        }
      }
    });

    socket.on("check online status", async (userIds, callback) => {
      if (pubClient?.isReady && Array.isArray(userIds)) {
        const onlineUserIds = await pubClient.sMembers("online_users");
        const status = userIds.map((id) => ({
          isOnline: onlineUserIds.includes(id),
        }));
        callback(status);
      }
    });
  });
};

export default setupSocket;
