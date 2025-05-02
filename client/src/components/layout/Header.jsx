import {
  AppBar,
  Backdrop,
  Badge,
  Box,
  IconButton,
  Skeleton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { server } from "../../constants/config";
import { userNotExist } from "../../redux/reducers/auth";
import axios from "axios";
import {
  setIsMobileMenu,
  setIsNewGroup,
  setIsNotification,
  setIsSearch,
} from "../../redux/reducers/misc";
import { lazy, Suspense } from "react";
import { resetNotificationsCount } from "../../redux/reducers/chat";

const SearchDialog = lazy(() => import("../specific/Search"));
const NotificationDialog = lazy(() => import("../specific/Notification"));
const NewGroupDialog = lazy(() => import("../specific/NewGroup"));
const Header = () => {
  const { isSearch, isNotification, isNewGroup } = useSelector(
    (state) => state.misc
  );
  const { notificationsCount } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleMobile = () => {
    dispatch(setIsMobileMenu(true));
  };
  const openSearch = () => {
    dispatch(setIsSearch(true));
    console.log("Open Search");
  };
  const handleLogout = async () => {
    try {
      const { data } = await axios.get(`${server}/api/v1/user/logout`, {
        withCredentials: true,
      });
      dispatch(userNotExist());
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };
  const openNewGroup = () => {
    dispatch(setIsNewGroup(true));
  };
  const navigateGroup = () => {
    navigate("/group");
  };
  const openNotification = () => {
    dispatch(setIsNotification(true));
    dispatch(resetNotificationsCount());
  };
  return (
    <>
      <Box sx={{ flexGrow: 1 }} height="4rem">
        <AppBar position="static" sx={{ bgcolor: "rgb(2,0,36)" }}>
          <Toolbar>
            <Typography
              variant="h5"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Chat
            </Typography>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <IconButton color="inherit" onClick={handleMobile}>
                <MenuIcon />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <Tooltip title="Search">
                <IconButton color="inherit" size="large" onClick={openSearch}>
                  <PersonSearchIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="New Group">
                <IconButton color="inherit" size="large" onClick={openNewGroup}>
                  <GroupAddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Manage Group">
                <IconButton
                  color="inherit"
                  size="large"
                  onClick={navigateGroup}
                >
                  <Diversity2Icon />
                </IconButton>
              </Tooltip>
              <Tooltip title="notification">
                <IconButton
                  color="inherit"
                  size="large"
                  onClick={openNotification}
                >
                  {notificationsCount ? (
                    <Badge badgeContent={notificationsCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  ) : (
                    <NotificationsIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton color="inherit" size="large" onClick={handleLogout}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      {isSearch && (
        <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
          <SearchDialog />
        </Suspense>
      )}
      {isNotification && (
        <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
          <NotificationDialog />
        </Suspense>
      )}
      {isNewGroup && (
        <Suspense fallback={<Backdrop open />}>
          <NewGroupDialog />
        </Suspense>
      )}
    </>
  );
};

export default Header;
