import { Box, Typography } from "@mui/material";

const Home = () => {
  return (
    <Box
      style={{
        background:
          "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(6,6,37,1) 11%, rgba(0,212,255,1) 100%) ",
      }}
      height={"100%"}
    >
      <Typography variant="h3" textAlign={"center"} p={"2rem"}>
        Select a person to Chat
      </Typography>
    </Box>
  );
};

export default Home;
