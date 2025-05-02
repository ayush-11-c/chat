import { styled, Skeleton, keyframes } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
export const VisuallyHiddenInput = styled("input")({
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: 1,
});

export const Link = styled(RouterLink)({
  textDecoration: "none",
  color: "inherit",
  padding: "0.5rem",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
});

export const InputBox = styled((prop) => <input {...prop} />)({
  height: "100%",

  padding: "0.5rem",
  borderRadius: "0.5rem",
  border: "2px solid #f9f9f9",
  width: "100%",
  "&:focus": {
    outline: "none",
  },
});

export const SearchFeild = styled("input")({
  padding: "1rem 2rem",
  width: "20vmax",
  borderRadius: "0.5rem",
  border: "1px solid gray",
  outline: "none",
  backgroundColor: "#cbcbcb",

  fontSize: "1.1rem",
});

export const CurveButton = styled("button")({
  padding: "1rem 2rem",
  borderRadius: "1.5rem",
  border: "1px solid gray",
  outline: "none",
  backgroundColor: "#cbcbcb",
  fontSize: "1.1rem",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "black",
    color: "white",
  },
});
const bounceAnimation = keyframes`
0% { transform: scale(1); }
50% { transform: scale(1.5); }
100% { transform: scale(1); }
`;

export const BouncingSkeleton = styled(Skeleton)(() => ({
  animation: `${bounceAnimation} 1s infinite`,
}));
