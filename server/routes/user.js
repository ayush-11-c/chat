import express from "express";
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotification,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
} from "../controller/user.js";

import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from "../lib/validators.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { multerUpload } from "../middlewares/multer.js";
const app = express.Router();
app.post(
  "/new",
  multerUpload.single("avatar"),
  registerValidator(),
  validateHandler,
  newUser
);
app.post("/login", loginValidator(), validateHandler, login);
app.use(isAuthenticated);
app.get("/me", getMyProfile);
app.get("/logout", logout);
app.get("/search", searchUser);
app.put(
  "/sendrequest",
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
);

app.put(
  "/acceptrequest",
  acceptRequestValidator(),
  validateHandler,
  acceptFriendRequest
);
app.get("/notification", getMyNotification);
app.get("/friends", getMyFriends);
export default app;
