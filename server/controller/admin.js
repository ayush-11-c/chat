import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";
import jwt from "jsonwebtoken";
import { cookieOption } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
const adminLogin = async (req, res, next) => {
  try {
    console.log("Admin login request received:", req.body);
    const { secretKey } = req.body;
    console.log(secretKey);
    const adminSecret = process.env.ADMIN_SECRET || "admin_secret";
    const isMatch = secretKey === adminSecret;
    if (!isMatch) {
      return next(new ErrorHandler(401, "Invalid Secret"));
    }
    const token = jwt.sign({ secretKey }, process.env.JWT_SECRET);
    return res
      .cookie("chat-admin-token", token, cookieOption)
      .status(200)
      .json({
        success: true,
        message: "Admin Logged In",
      });
  } catch (error) {
    console.error("Error in adminLogin controller:", error);
    return next(new ErrorHandler(500, error.message));
  }
};

const allUser = async (req, res, next) => {
  try {
    const users = await User.find({});
    const transformedUsers = await Promise.all(
      users.map(async ({ name, username, avatar, _id }) => {
        const [groups, friends] = await Promise.all([
          Chat.countDocuments({ groupChat: true, members: _id }),
          Chat.countDocuments({ groupChat: false, members: _id }),
        ]);

        return {
          name,
          username,
          avatar: avatar.url,
          _id,
          groups,
          friends,
        };
      })
    );

    return res.status(200).json({
      success: true,
      users: transformedUsers,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const getAdminData = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      admin: true,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const allChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");

    // Preload message counts for all chats at once (better performance)
    const messageCounts = await Message.aggregate([
      { $group: { _id: "$chat", total: { $sum: 1 } } },
    ]);

    const messageCountMap = {};
    messageCounts.forEach(({ _id, total }) => {
      messageCountMap[_id.toString()] = total;
    });

    const transformedChats = chats.map(
      ({ members, _id, groupChat, name, creator }) => {
        return {
          _id,
          name,
          groupChat,
          avatar: members.slice(0, 3).map(({ avatar }) => avatar?.url || ""), // safer
          members: members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar?.url || "",
          })),
          creator: {
            name: creator?.name || "none",
            avatar: creator?.avatar?.url || "",
          },
          totalMessages: messageCountMap[_id.toString()] || 0,
          totalMembers: members.length,
        };
      }
    );

    return res.status(200).json({
      success: true,
      chats: transformedChats,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const allMessages = async (req, res, next) => {
  const ayushnull = "Ayush null";
  try {
    const messages = await Message.find({})
      .populate("sender", "name avatar")
      .populate("chat", "groupChat");

    const transformedMessages = messages.map(
      ({ content, attachments, _id, sender, createdAt, chat }) => ({
        _id,
        sender: sender
          ? {
              _id: sender._id,
              name: sender.name,
              avatar: sender?.avatar?.url || "",
            }
          : {
              _id: ayushnull,
              name: ayushnull,
              avatar: "",
            },
        chat: chat ? chat._id : ayushnull,
        groupChat: chat.groupChat,
        attachments,
        content,
        createdAt,
      })
    );

    return res.status(200).json({
      success: true,
      messages: transformedMessages,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const getdashboardStats = async (req, res, next) => {
  try {
    const [groupsCount, usersCount, messagesCount, totalChatsCount] =
      await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments(),
      ]);

    const today = new Date();

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const last7DaysMessages = await Message.find({
      createdAt: {
        $gte: last7Days,
        $lte: today,
      },
    }).select("createdAt");

    const messages = new Array(7).fill(0);
    const dayInMiliseconds = 1000 * 60 * 60 * 24;

    last7DaysMessages.forEach((message) => {
      const indexApprox =
        (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
      const index = Math.floor(indexApprox);

      messages[6 - index]++;
    });

    const stats = {
      groupsCount,
      usersCount,
      messagesCount,
      totalChatsCount,
      messagesChart: messages,
    };

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};
const adminLogout = async (req, res, next) => {
  try {
    return res
      .cookie("chat-admin-token", "", { ...cookieOption, maxAge: 0 })
      .status(200)
      .json({
        success: true,
        message: "Admin Logged out",
      });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};
export {
  adminLogin,
  allUser,
  allChats,
  allMessages,
  getdashboardStats,
  adminLogout,
  getAdminData,
};
