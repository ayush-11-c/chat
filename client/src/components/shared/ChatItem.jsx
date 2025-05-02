/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";
import { Link } from "../styles/StyledComponent";
import { memo } from "react";
import AvatarCard from "./AvatarCard";
import { motion } from "framer-motion";
const ChatItem = ({
  avatar = [],
  name,
  _id,
  groupChat = false,
  sameSender,
  isOnline,
  newMessage,
  index = 0,
  handleDeleteChat,
}) => {
  return (
    <Link
      sx={{ padding: "0" }}
      to={`/chat/${_id}`}
      onContextMenu={(e) => handleDeleteChat(e, _id, groupChat)}
    >
      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.5rem",
          backgroundColor: sameSender ? "black" : "unset",
          color: sameSender ? "white" : "unset",
          gap: "0.5rem",
          position: "relative",
        }}
      >
        <AvatarCard avatar={avatar} />
        <Stack>
          <Typography variant="h6">{name}</Typography>
          {newMessage && (
            <Typography>{newMessage.count} New Message </Typography>
          )}
        </Stack>
        {isOnline && (
          <Box
            sx={{
              width: "0.5rem",
              height: "0.5rem",
              bgcolor: "green",
              borderRadius: "50%",
            }}
          />
        )}
      </motion.div>
    </Link>
  );
};

export default memo(ChatItem);
