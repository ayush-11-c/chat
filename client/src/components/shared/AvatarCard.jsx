import { Avatar, AvatarGroup, Box, Stack } from "@mui/material";
import { transformImage } from "../../lib/features";

const AvatarCard = ({ avatar = [], max = 4 }) => {
  return (
    <Stack direction={"row"} spacing={0.5}>
      <AvatarGroup max={max} sx={{ position: "relative" }}>
        <Box width={"5rem"} height={"3rem"}>
          {avatar.map((i, index) => (
            <Avatar
              key={Math.random() * 10}
              src={transformImage(i)}
              alt={`avatar-${index}`}
              style={{
                width: "3rem",
                height: "3rem",
                position: "absolute",
                left: {
                  xs: `${index + 0.5}rem`,
                  sm: `${index}rem`,
                },
                borderRadius: "50%",
                border: "2px solid white",
              }}
            />
          ))}
        </Box>
      </AvatarGroup>
    </Stack>
  );
};

export default AvatarCard;
