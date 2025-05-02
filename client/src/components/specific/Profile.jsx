/* eslint-disable react/prop-types */
import { Avatar, Stack, Typography } from "@mui/material";

import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FaceIcon from "@mui/icons-material/Face";
import moment from "moment";
const Profile = ({ user }) => {
  return (
    <Stack spacing={"2rem"} direction={"column"} alignItems={"center"}>
      <Avatar
        src={user?.avatar?.url}
        sx={{
          width: 200,
          height: 200,
          objectFit: "contain",
          border: "5px solid #fff",
        }}
      />
      <ProfileCard
        Icon={AlternateEmailIcon}
        text={user?.name}
        heading={"Name"}
      />
      <ProfileCard Icon={FaceIcon} text={user?.bio} heading={"Bio"} />
      <ProfileCard
        Icon={CalendarMonthIcon}
        text={moment(user?.createdAt).fromNow()}
        heading={"Joned"}
      />
    </Stack>
  );
};

const ProfileCard = ({ Icon, text, heading }) => (
  <Stack
    direction={"row"}
    spacing={"1rem"}
    alignItems={"center"}
    color={"#fff"}
    textAlign={"center"}
  >
    {Icon && <Icon sx={{ fontSize: "1.5rem" }} />}
    <Stack>
      <Typography variant={"body1"}>{heading}</Typography>
      <Typography color="gray" variant={"caption"}>
        {text}
      </Typography>
    </Stack>
  </Stack>
);

export default Profile;
