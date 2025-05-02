import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import {
  addMember,
  deleteChat,
  getChatDetails,
  getMessage,
  getMyChats,
  getMyGroup,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
} from "../controller/chat.js";
import { multerUpload } from "../middlewares/multer.js";
import {
  addMemberValidator,
  chatIdValidator,
  newGroupValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  validateHandler,
} from "../lib/validators.js";

const app = express.Router();

app.use(isAuthenticated);
app.post("/new", newGroupValidator(), validateHandler, newGroupChat);
app.get("/my", getMyChats);
app.get("/my/groups", getMyGroup);
app.put("/addmember", addMemberValidator(), validateHandler, addMember);
app.put(
  "/removemember",
  removeMemberValidator(),
  validateHandler,
  removeMember
);
app.delete("/leave/:id", chatIdValidator(), validateHandler, leaveGroup);
app.post(
  "/message",
  multerUpload.array("files", 10),
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments
);
app.get("/message/:id", chatIdValidator(), validateHandler, getMessage);
app
  .route("/:id")
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat);

export default app;
