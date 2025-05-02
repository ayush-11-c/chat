import {
  ALERT,
  NEW_MESSAGE_ALLERT,
  NEW_MESSAGEs,
  REFETCH_CHAT,
} from "../constant/event.js";
import { getOtherMember } from "../lib/helper.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import {
  deleteFilesFromCloudinary,
  emitEvent,
  uploadFilesToCloudinary2,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
const newGroupChat = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const allMember = [...members, req.user];
    await Chat.create({
      name,
      members: allMember,
      groupChat: true,
      creator: req.user,
    });
    res.status(201).json({ message: "Group Chat Created" });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ members: req.user }).populate(
      "members",
      "name  avatar"
    );

    const transformedChat = chats.map(({ _id, name, members, groupChat }) => {
      const currUser = req.user;
      const otherMember = getOtherMember(members, currUser);
      if (!groupChat && !otherMember) return null;

      return {
        _id,
        groupChat,
        avatar: groupChat
          ? members.slice(0, 3).map(({ avatar }) => avatar.url)
          : [otherMember.avatar.url],
        name: groupChat ? name : otherMember.name,
        members: members.reduce((prev, curr) => {
          if (curr._id.toString() !== req.user.toString()) {
            prev.push(curr._id);
          }
          return prev;
        }, []),
      };
    });

    return res.status(200).json({ chats: transformedChat });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const getMyGroup = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      members: req.user,
      groupChat: true,
      creator: req.user,
    }).populate("members", "name avatar");

    const groups = chats.map(({ members, _id, groupChat, name }) => {
      return {
        _id,
        name,
        members,
        groupChat,
        avatar: members.map(({ avatar }) => avatar.url),
      };
    });
    return res.status(200).json({ groups });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};
const addMember = async (req, res, next) => {
  try {
    const { chatId, members } = req.body;
    if (!members || members.length === 0) {
      return next(new ErrorHandler(400, "No member to add"));
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(
        new ErrorHandler(404, "Chat not found need to be friends frist ")
      );
    }
    if (!chat.groupChat) {
      return next(new ErrorHandler(400, "This is not a group chat"));
    }
    if (chat.creator.toString() !== req.user.toString()) {
      return next(
        new ErrorHandler(403, "You are not the creator of this group")
      );
    }
    const allNewMembersPromise = members.map((i) => User.findById(i, "name"));
    const allNewMembers = await Promise.all(allNewMembersPromise);
    const uniqueMembers = allNewMembers
      .filter((i) => !chat.members.includes(i._id))
      .map((i) => i._id);
    chat.members.push(...uniqueMembers);
    await chat.save();
    const allUser = allNewMembers.map((i) => i.name).join(",");

    emitEvent(req, REFETCH_CHAT, chat.members, "Refetch Chat");
    return res.status(200).json({ message: "Members added" });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};
const removeMember = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;
    const [chat, userThatToRemove] = await Promise.all([
      Chat.findById(chatId),
      User.findById(userId),
    ]);
    if (!chat) {
      return next(new ErrorHandler(404, "Chat not found"));
    }
    if (!chat.groupChat) {
      return next(new ErrorHandler(400, "This is not a group chat"));
    }
    if (chat.creator.toString() !== req.user.toString()) {
      return next(
        new ErrorHandler(403, "You are not the creator of this group")
      );
    }
    if (!chat.members.includes(userId)) {
      return next(new ErrorHandler(400, "User is not a member of this group"));
    }
    if (chat.members.length === 3) {
      return next(
        new ErrorHandler(400, "You can't remove member from this group")
      );
    }
    const allMembers = chat.members.map((i) => i.toString());
    chat.members = chat.members.filter(
      (i) => i.toString() !== userId.toString()
    );
    await chat.save();
    emitEvent(req, ALERT, chat.members, `${userThatToRemove.name} removed`);
    emitEvent(req, REFETCH_CHAT, allMembers, "Refetch Chat");
    return res.status(200).json({ message: "Member removed" });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    if (!chatId) {
      return next(new ErrorHandler(400, "Chat id is required"));
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandler(404, "Chat not found"));
    }
    if (!chat.groupChat) {
      return next(new ErrorHandler(400, "This is not a group chat"));
    }
    const remainingMembers = chat.members.filter(
      (i) => i.toString() !== req.user.toString()
    );
    if (chat.creator.toString() === req.user.toString()) {
      await chat.remove();
    }
    chat.members = remainingMembers;
    await chat.save();
    emitEvent(req, ALERT, chat.members, "Member left the group");
    emitEvent(req, REFETCH_CHAT, chat.members, "Refetch Chat");
    return res.status(200).json({ message: "Member left" });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const sendAttachments = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    const [chat, user] = await Promise.all([
      Chat.findById(chatId),
      User.findById(req.user),
    ]);
    const files = req.files || [];

    if (files.length === 0) {
      return next(new ErrorHandler(400, "No file uploaded"));
    }
    if (!chat) {
      return next(new ErrorHandler(404, "Chat not found"));
    }
    if (!chat.members.includes(req.user)) {
      return next(new ErrorHandler(403, "You are not a member of this chat"));
    }
    const attachments = await uploadFilesToCloudinary2(files);

    const messageForRealTime = {
      content: "",
      attachments,
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
    };
    const messageForDB = {
      content: "",
      attachments,
      sender: user._id,
      chat: chatId,
    };
    const message = await Message.create(messageForDB);
    console.log("Message", message);
    emitEvent(req, NEW_MESSAGEs, chat.members, {
      message: messageForRealTime,
      chatId,
    });
    emitEvent(req, NEW_MESSAGE_ALLERT, chat.members, {
      chatId,
    });
    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};
const getChatDetails = async (req, res, next) => {
  try {
    if (req.query.populate === "true") {
      const chat = await Chat.findById(req.params.id)
        .populate("members", "name avatar")
        .lean();
      if (!chat) {
        return next(new ErrorHandler(404, "Chat not found"));
      }
      chat.members = chat.members.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url,
      }));

      return res.status(200).json({ success: true, chat });
    } else {
      const chat = await Chat.findById(req.params.id);
      if (!chat) {
        return next(new ErrorHandler(404, "Chat not found"));
      }
      return res.status(200).json({ success: true, chat });
    }
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};
const renameGroup = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { name } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandler(404, "Chat not found"));
    }
    if (chat.groupChat === false) {
      return next(new ErrorHandler(400, "This is not a group chat"));
    }
    if (chat.creator.toString() !== req.user.toString()) {
      return next(
        new ErrorHandler(403, "You are not the creator of this group")
      );
    }
    chat.name = name;
    await chat.save();
    emitEvent(req, ALERT, chat.members, "Group name changed");
    emitEvent(req, REFETCH_CHAT, chat.members, "Refetch Chat");
    return res
      .status(200)
      .json({ success: true, message: "Group name changed" });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};

const deleteChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    if (!chatId) {
      return next(new ErrorHandler(400, "Chat id is required"));
    }
    console.log("ChatId", chatId);

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandler(404, "Chat not found"));
    }
    const members = chat.members;
    if (chat.groupChat && chat.creator.toString() !== req.user.toString()) {
      return next(
        new ErrorHandler(403, "You are not the creator of this group")
      );
    }
    if (!chat.groupChat && !chat.members.includes(req.user)) {
      return next(new ErrorHandler(403, "You are not a member of this chat"));
    }
    const messagesWithAttachment = await Message.find({
      chat: chatId,
      attachment: { $exists: true, $ne: [] },
    });
    const public_ids = [];
    messagesWithAttachment.forEach(({ attachments }) =>
      attachments.forEach(({ public_id }) => public_ids.push(public_id))
    );
    await Promise.all([
      deleteFilesFromCloudinary(public_ids),
      chat.deleteOne(),
      Message.deleteMany({ chat: chatId }),
    ]);

    emitEvent(req, REFETCH_CHAT, chat.members, "Chat deleted");
    return res.status(200).json({ message: "Chat deleted" });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(500, error.message));
  }
};

const getMessage = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandler(404, "Chat not found"));
    }
    if (!chat.members.includes(req.user)) {
      return next(new ErrorHandler(403, "You are not a member of this chat"));
    }
    const [messages, totalMessagesCount] = await Promise.all([
      Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("sender", "name avatar")
        .lean(),
      Message.countDocuments({ chat: chatId }),
    ]);

    const totalPage = Math.ceil(totalMessagesCount / limit);
    const hasMore = totalPage > page;
    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
      totalPage,
      hasMore,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message));
  }
};
export {
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
};
