import { Stack } from "@mui/material";
import ChatItem from "../shared/ChatItem";
import PropTypes from "prop-types";

const ChatList = ({
  w = "100%",
  chats = [],
  chatId,
  onlineUsers = [],
  newMessageAllert = [{ chatId: "", count: 0 }],
  handleDeleteChat,
}) => {
  const filtered = chats.filter(Boolean);

  return (
    <Stack width={w} direction={"column"} overflow={"auto"} height={"100%"}>
      {filtered?.map((chat, index) => {
        const { avatar, _id, name, groupChat, members } = chat;
        const newMessage = newMessageAllert.find(
          ({ chatId }) => chatId === _id
        );
        const isOnline = members.some((member) => onlineUsers.includes(member));
        return (
          <ChatItem
            key={chat._id}
            newMessage={newMessage}
            isOnline={isOnline}
            avatar={avatar}
            name={name}
            _id={_id}
            groupChat={groupChat}
            sameSender={chatId === _id}
            handleDeleteChat={handleDeleteChat}
            index={index}
          />
        );
      })}
    </Stack>
  );
};
ChatList.propTypes = {
  w: PropTypes.string,
  chats: PropTypes.array,
  chatId: PropTypes.string,
  onlineUsers: PropTypes.array,
  newMessageAllert: PropTypes.arrayOf(
    PropTypes.shape({
      chatId: PropTypes.string,
      count: PropTypes.number,
    })
  ),
  handleDeleteChat: PropTypes.func,
};

export default ChatList;
