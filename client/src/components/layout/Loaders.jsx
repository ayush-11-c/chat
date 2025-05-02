import { Grid2, Skeleton, Stack } from "@mui/material";

import { BouncingSkeleton } from "../styles/StyledComponent";

const LayoutLoader = () => {
  return (
    <Grid2 container height={"calc(100vh - 4rem)"} spacing={2}>
      <Grid2
        item
        sm={4}
        md={3}
        sx={{
          display: { xs: "none", sm: "block" },
        }}
        height={"100%"}
      >
        <Skeleton variant="rectangular" height={"100vh"} />
      </Grid2>
      <Grid2 item xs={12} sm={8} md={5} lg={6} height={"100%"}>
        <Stack spacing={2}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={"5rem"} />
          ))}
        </Stack>
      </Grid2>

      <Grid2
        item
        md={4}
        lg={3}
        height={"100%"}
        sx={{
          display: { xs: "none", md: "block" },
        }}
      >
        <Skeleton variant="rectangular" height={"100vh"} />
      </Grid2>
    </Grid2>
  );
};

const TypingLoader = () => {
  return (
    <Stack spacing={1} direction={"row"} padding={1} justifyContent={"center"}>
      {Array.from({ length: 4 }).map((_, index) => (
        <BouncingSkeleton
          key={index}
          variant="circular"
          width={15}
          height={15}
          style={{
            animationDelay: `${0.1 * (index + 1)}s`,
            backgroundColor: "#f9f9f9",
          }}
        />
      ))}
    </Stack>
  );
};

export { LayoutLoader, TypingLoader };
