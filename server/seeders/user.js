import { faker, simpleFaker } from "@faker-js/faker";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";
const createuser = async (num) => {
  try {
    const userarr = [];
    for (let i = 0; i < num; i++) {
      const user = User.create({
        name: faker.person.firstName(),
        username: faker.internet.username(),
        password: "password",
        avatar: {
          public_id: faker.string.uuid(),
          url: faker.image.avatar(),
        },
      });
      userarr.push(user);
      console.log(`User ${i} created`);
    }
    await Promise.all(userarr);
    process.exit(1);
  } catch (error) {
    console.error("Error: ", error);
    process.exit(1);
  }
};
const createSampleChats = async (chatCount) => {
  const user = await User.find().select("_id");
  const arr = [];
  for (let i = 0; i < chatCount; i++) {
    for (let j = 0; j < i + 1; j++) {
      arr.push(
        Chat.create({
          name: faker.lorem.words(5),
          members: [user[i]._id, user[j]._id],
        })
      );
    }
  }
  await Promise.all(arr);
  console.log("Chats Created");
  process.exit(1);
};

const createSampleGroupChat = async (num) => {
  const user = await User.find().select("_id");
  const arr = [];
  for (let i = 0; i < num; i++) {
    const nummem = simpleFaker.number.int({ min: 3, max: user.length });
    const members = [];
    for (let j = 0; j < nummem; j++) {
      members.push(user[Math.floor(Math.random() * user.length)]._id);
      if (!members.includes(user[i]._id)) {
        members.push(user[i]._id);
      }
    }
    arr.push(
      Chat.create({
        name: faker.lorem.words(5),
        members,
      })
    );
  }
  await Promise.all(arr);
  console.log("Group Chat Created");
  process.exit(1);
};
const createSampleMessages = async (num) => {
  const user = await User.find().select("_id");
  const chats = await Chat.find().select("_id");
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(
      Message.create({
        chat: chats[Math.floor(Math.random() * chats.length)]._id,
        sender: user[Math.floor(Math.random() * user.length)]._id,
        message: faker.lorem.words(10),
      })
    );
  }
  await Promise.all(arr);
  console.log("Messages Created");
  process.exit(1);
};
const createMessageInChat = async (chatId, num) => {
  const user = await User.find().select("_id");
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(
      Message.create({
        chat: chatId,
        sender: user[Math.floor(Math.random() * user.length)]._id,
        content: faker.lorem.words(10),
      })
    );
  }
  await Promise.all(arr);
  console.log("Messages Created");
  process.exit(1);
};
export {
  createSampleChats,
  createSampleGroupChat,
  createSampleMessages,
  createuser,
  createMessageInChat,
};
