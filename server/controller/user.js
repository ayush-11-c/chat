import { compare } from "bcrypt";
import { NEW_REQUEST, REFETCH_CHAT } from "../constant/event.js";
import { getOtherMember } from "../lib/helper.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import {
  cookieOption,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import { getBase64 } from "../lib/helper.js";
const newUser = async (req, res) => {
  try {
    const { name, username, password, bio } = req.body;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const base64File = getBase64(req.file);
    const result = await uploadFilesToCloudinary([base64File]);

    const avatar = {
      public_id: result[0].public_id,
      url: result[0].url,
    };

    const user = await User.create({
      name,
      username,
      password,
      bio,
      avatar,
    });

    sendToken(res, user, 201, "User Created");
  } catch (error) {
    console.error("Error in newUser controller:", error);
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return next(new ErrorHandler(400, "No user found"));
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler(400, "Invalid Credentials"));
    }
    sendToken(res, user, 200, `Welcome ${user.name}`);
  } catch (error) {
    console.error("Error in login controller:", error);
    return next(new ErrorHandler(500, error.message));
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      return next(new ErrorHandler(404, "User Not Found"));
    }
    res.status(200).json({ user });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const logout = async (req, res, next) => {
  try {
    return res
      .status(200)
      .cookie("chat-cookies", "", { ...cookieOption, maxAge: 0 })
      .json({
        success: true,
        message: "Logged Out",
      });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};
const searchUser = async (req, res, next) => {
  try {
    const { name = "" } = req.query;
    const myChats = await Chat.find({ groupChat: false, members: req.user });

    const allMyFriends = myChats.map((chat) => chat.members).flat();
    const allUserExceptMeAndFriends = await User.find({
      _id: { $nin: allMyFriends },
      name: { $regex: name, $options: "i" },
    });
    const users = allUserExceptMeAndFriends.map((user) => ({
      _id: user._id,
      name: user.name,

      avatar: user.avatar.url,
    }));
    console.log(name);
    return res
      .status(200)

      .json({
        success: true,
        users,
      });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const sendFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const request = await Request.findOne({
      $or: [
        { sender: req.user, receiver: userId },
        { sender: userId, receiver: req.user },
      ],
    });
    if (request) {
      return next(new ErrorHandler(400, "Request Already Sent"));
    }
    await Request.create({
      sender: req.user,
      receiver: userId,
    });
    emitEvent(req, NEW_REQUEST, [userId]);

    res.status(200).json({ success: true, message: "newRequest" });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId, accept } = req.body;

    const request = await Request.findById(requestId)
      .populate("sender", "name")
      .populate("receiver", "name");
    if (!request) {
      return next(new ErrorHandler(400, "Request Not Found"));
    }
    if (request.receiver._id.toString() !== req.user.toString()) {
      return next(
        new ErrorHandler(403, "You are not allowed to accept this request")
      );
    }
    if (!accept) {
      await request.deleteOne();
      return res.status(200).json({
        success: true,
        message: "request rejected",
      });
    }
    const members = [request.sender._id, request.receiver._id];
    await Promise.all([
      Chat.create({
        members,
        name: `${request.sender.name}-${request.receiver.name}`,
      }),
      request.deleteOne(),
    ]);

    emitEvent(req, REFETCH_CHAT, members);

    return res.status(200).json({
      success: true,
      message: "request accepted",
      senderId: request.sender._id,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const getMyNotification = async (req, res, next) => {
  try {
    const requests = await Request.find({ receiver: req.user }).populate(
      "sender",
      "name avatar "
    );

    const allRequest = requests.map(({ _id, sender }) => ({
      _id,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    }));

    return res.status(200).json({
      success: true,
      allRequest,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const getMyFriends = async (req, res, next) => {
  try {
    const chatId = req.query.chatId;
    const chat = await Chat.find({
      members: req.user,
      groupChat: false,
    }).populate("members", "name avatar");
    const friends = chat.map(({ members }) => {
      if (!members) return null;
      const otherUser = getOtherMember(members, req.user);

      if (!otherUser) return null;
      return {
        _id: otherUser._id,
        name: otherUser.name,
        avatar: otherUser.avatar.url,
      };
    });

    if (chatId) {
      const cleanFriends = Array.from(
        new Map(
          friends
            .filter((friend) => friend !== null)
            .map((friend) => [friend._id, friend])
        ).values()
      );
      const chat = await Chat.findById(chatId);
      const availableFriends = cleanFriends.filter(
        (friend) => !chat.members.includes(friend._id)
      );
      return res.status(200).json({
        success: true,
        friends: availableFriends,
      });
    } else {
      return res.status(200).json({
        success: true,
        friends,
      });
    }
  } catch (error) {
    console.error("Error in getMyFriends controller:", error);
    return next(new ErrorHandler(500, error.message));
  }
};

export {
  acceptFriendRequest,
  getMyNotification,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
  getMyFriends,
};
