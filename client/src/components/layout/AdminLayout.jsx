/* eslint-disable react/prop-types */
import {
  Box,
  Drawer,
  Grid2,
  IconButton,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import {
  Close,
  Dashboard,
  ExitToApp,
  Group,
  ManageAccounts,
  Menu,
  Message,
} from "@mui/icons-material";
import { useState } from "react";
import { useLocation, Link as LinkC, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../../redux/thunks/admin";

const Link = styled(LinkC)`
  text-decoration: none;
  border-radius: 0.5rem;
  color: black;
  padding: 1rem 2rem;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const adminTabs = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <Dashboard />,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <ManageAccounts />,
  },
  {
    name: "Chats",
    path: "/admin/chats",
    icon: <Group />,
  },
  {
    name: "Messages",
    path: "/admin/messages",
    icon: <Message />,
  },
];

const Sidebar = ({ w = "100%" }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const logoutHandler = () => {
    dispatch(adminLogout());
  };
  return (
    <Stack width={w} direction={"column"} p={"3rem"} spacing={"3rem"}>
      <Typography varient="h4">Admin Panel</Typography>
      <Stack spacing={"1rem"}>
        {adminTabs.map((i) => (
          <Link
            to={i.path}
            key={i.path}
            sx={
              location.pathname === i.path && {
                backgroundColor: "black",
                color: "white",
                ":hover": {
                  color: "gray",
                },
              }
            }
          >
            <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
              {i.icon}
              <Typography>{i.name}</Typography>
            </Stack>
          </Link>
        ))}
        <Link onClick={logoutHandler}>
          <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
            <ExitToApp />
            <Typography>LogOut</Typography>
          </Stack>
        </Link>
      </Stack>
    </Stack>
  );
};
const AdminLayout = ({ children }) => {
  const { isAdmin } = useSelector((state) => state.auth);
  const [isMobile, setIsMobile] = useState(false);
  const handleMobile = () => {
    setIsMobile((prev) => !prev);
  };
  const handleClose = () => {
    setIsMobile(false);
  };
  if (!isAdmin) {
    return <Navigate to="/admin" />;
  }
  return (
    <Grid2 container minHeight={"100vh"}>
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          right: "1rem",
          top: "1rem",
        }}
      >
        <IconButton onClick={handleMobile}>
          {isMobile ? <Close /> : <Menu />}
        </IconButton>
      </Box>
      <Grid2
        item
        size={{ md: 4, lg: 3 }}
        sx={{
          display: { xs: "none", md: "block" },
        }}
      >
        <Sidebar />
      </Grid2>
      <Grid2
        item
        size={{ xs: 12, md: 8, lg: 9 }}
        sx={{ bgcolor: "#b3b3b3", height: "100vh" }}
      >
        {children}
      </Grid2>
      <Drawer open={isMobile} onClose={handleClose}>
        <Sidebar w="50vw" />
      </Drawer>
    </Grid2>
  );
};

export default AdminLayout;
