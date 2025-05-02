import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import admin from "./routes/admin.js";
import chat from "./routes/chat.js";
import user from "./routes/user.js";
import { connectDb } from "./utils/features.js";
import { Server } from "socket.io";
import { createServer } from "http";
import {
  CHAT_JOINED,
  CHAT_LEFT,
  NEW_MESSAGE_ALLERT,
  NEW_MESSAGEs,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
} from "./constant/event.js";
import { v4 as uuid } from "uuid";
import { Message } from "./models/message.js";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import { corsOption } from "./constant/config.js";
import { socketAuth } from "./middlewares/auth.js";
import { getSockets } from "./lib/helper.js";
dotenv.config({});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const port = process.env.PORT || 3000;

connectDb(process.env.mongoURI);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOption,
});
app.set("io", io);
const userSocketIDs = new Map();
const onlineUsers = new Set();
app.use(express.json());

app.use(cookieParser());
app.use(cors(corsOption));

app.use("/api/v1/user", user);
app.use("/api/v1/chat", chat);
app.use("/api/v1/admin", admin);

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuth(err, socket, next)
  );
});

io.on("connection", (socket) => {
  const user = socket.user;
  console.log("User connected", user._id);
  userSocketIDs.set(user._id.toString(), socket.id);

  socket.on(NEW_MESSAGEs, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };
    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };
    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGEs, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALLERT, { chatId });
    try {
      await Message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  });
  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });
  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());
    const membersSockets = getSockets(members);
    io.to(membersSockets).emit(ONLINE_USERS, Array.from(onlineUsers));
  });
  socket.on(CHAT_LEFT, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());
    const membersSockets = getSockets(members);
    io.to(membersSockets).emit(ONLINE_USERS, Array.from(onlineUsers));
  });
  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
    console.log("User disconnected");
  });
});

app.use(errorMiddleware);
app.get("/", (req, res) => {
  res.send("Home Page");
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { userSocketIDs };
