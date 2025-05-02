import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { User } from "../models/user.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies["chat-cookies"];
    if (!token) {
      return next(new ErrorHandler(401, "Login First no token "));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("decoded", decoded._id);
    req.user = decoded._id;

    next();
  } catch (error) {
    return next(new ErrorHandler(401, "Login First"));
  }
};
const adminOnly = async (req, res, next) => {
  try {
    const token = req.cookies["chat-admin-token"];

    if (!token) {
      return next(new ErrorHandler(401, "Login through admin First"));
    }

    const adminSecret = jwt.verify(token, process.env.JWT_SECRET);

    const isMatch = adminSecret.secretKey === process.env.ADMIN_SECRET;
    if (!isMatch) {
      return next(new ErrorHandler(401, "Invalid Secret"));
    }

    next();
  } catch (error) {
    console.log("error", error);
    return next(new ErrorHandler(401, "Invalid Secret"));
  }
};

const socketAuth = async (err, socket, next) => {
  try {
    if (err) return next(new ErrorHandler(401, "socket error"));
    const authToken = socket.request.cookies["chat-cookies"];
    if (!authToken) return next(new ErrorHandler(401, "socket Login First"));

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    if (!decoded) return next(new ErrorHandler(401, "socket Login First"));
    const user = await User.findById(decoded._id);
    if (!user) return next(new ErrorHandler(401, "socket Login First"));
    socket.user = user;
    return next();
  } catch (error) {
    console.log("socket error", error);
    return next(new ErrorHandler(401, " socket Login First"));
  }
};

export { isAuthenticated, adminOnly, socketAuth };
