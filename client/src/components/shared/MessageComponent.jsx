/* eslint-disable react/prop-types */
import { memo } from "react";
import { Box, Typography } from "@mui/material";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import { motion } from "framer-motion";
import RenderAttachment from "./RenderAttachment";
const MessageComponent = ({ user, message }) => {
  const { sender, content, attachments = [], createdAt } = message;

  const sameSender = sender?._id === user?._id;
  const timeAgo = moment(createdAt).fromNow();
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: "-100%",
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      style={{
        alignSelf: sameSender ? "flex-end" : "flex-start",
        background: "#f9f9f9",
        color: "black",
        padding: "0.5rem",
        borderRadius: "0.5rem",
        width: "fit-content",
      }}
    >
      {!sameSender && (
        <Typography color="red" fontWeight={"600"} variant="caption">
          {sender.name}
        </Typography>
      )}
      {content && <Typography>{content}</Typography>}
      {attachments.length > 0 &&
        attachments.map((attachment, index) => {
          const url = attachment.url;
          const file = fileFormat(url);

          return (
            <Box key={index}>
              <a
                href={url}
                target="_blank"
                download
                style={{
                  color: "black",
                }}
              >
                {RenderAttachment(file, url)}
              </a>
            </Box>
          );
        })}

      <Typography variant="caption" color={"textSecondary"}>
        {timeAgo}
      </Typography>
    </motion.div>
  );
};

export default memo(MessageComponent);
