/* eslint-disable react/prop-types */
import { Add, Remove } from "@mui/icons-material";
import { Avatar, IconButton, ListItem, Stack, Typography } from "@mui/material";
import { memo } from "react";
import { transformImage } from "../../lib/features";

const UserItem = ({
  user,
  handler,
  handlerIsloading,
  isAdded = false,
  styling = {},
}) => {
  const { name, _id, avatar } = user;
  return (
    <ListItem>
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        width={"100%"}
        justifyContent={"space-between"}
        {...styling}
      >
        <Avatar src={transformImage(avatar)} />
        <Typography
          varient="body1"
          sx={{
            flexGlow: 1,
            display: "-webkit-flex",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </Typography>
        <IconButton
          size="small"
          sx={{
            bgcolor: isAdded ? "error.main" : "primary.main",
            color: "white",
            "&:hover": { bgcolor: isAdded ? "primary.dark" : "error.dark" },
          }}
          onClick={() => handler(_id)}
          disabled={handlerIsloading}
        >
          {isAdded ? <Remove /> : <Add />}
        </IconButton>
      </Stack>
    </ListItem>
  );
};

export default memo(UserItem);
