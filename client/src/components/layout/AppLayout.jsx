import { Drawer, Grid2, Skeleton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useErrors, useSocketEvents } from "../../hooks/hook";
import { useMyChatsQuery } from "../../redux/api/api";
import {
  setChatId,
  setIsDeleteMenu,
  setIsMobileMenu,
  setSelectedDeleteChat,
} from "../../redux/reducers/misc";
import Title from "../shared/Title";
import ChatList from "../specific/ChatList";
import Profile from "../specific/Profile";
import Header from "./Header";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../socket";
import {
  NEW_MESSAGE_ALLERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHAT,
} from "../../constants/event";
import {
  incrimentNotificationsCount,
  setNewMessageAllert,
} from "../../redux/reducers/chat";
import { getFromStorage } from "../../lib/features";
import DeleteChatMenu from "../dialogs/DeleteChatMenu";
const AppLayout = () => {
  const { notificationsCount } = useSelector((state) => state.chat);
  const params = useParams();

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const chatId = params.chatId;
  const socket = useContext(SocketContext);

  const deleteMenuAnchor = useRef(null);
  const [onLineUsers, setOnlineUsers] = useState([]);
  useEffect(() => {
    if (chatId) {
      dispatch(setChatId(chatId));
    }
  }, [chatId, dispatch]);

  const { isMobileMenu } = useSelector((state) => state.misc);
  const { user } = useSelector((state) => state.auth);
  const { newMessageAllert } = useSelector((state) => state.chat);

  const { isLoading, data, isError, error, refetch } = useMyChatsQuery();

  useErrors([isError, error]);

  const handleDeleteChat = (e, _id, groupChat) => {
    dispatch(setIsDeleteMenu(true));
    dispatch(setSelectedDeleteChat({ chatId, groupChat }));
    deleteMenuAnchor.current = e.currentTarget;
  };
  const handleMobileMenuClose = () => dispatch(setIsMobileMenu(false));
  const newMessageAllertHandler = useCallback(
    (data) => {
      if (data.chatId === chatId) return;
      dispatch(setNewMessageAllert(data));
    },
    [chatId, dispatch]
  );
  const newRequestHandler = useCallback(() => {
    dispatch(incrimentNotificationsCount());
    console.log("notification");
  }, [dispatch]);
  const refetchHandler = useCallback(async () => {
    console.log("refetching chat");

    await refetch();
    navigate("/");

    console.log("refetching chat done");
  }, [refetch, navigate]);
  const onlineUserHandler = useCallback((data) => {
    setOnlineUsers(data);
  }, []);
  const eventHandlers = {
    [NEW_MESSAGE_ALLERT]: newMessageAllertHandler,
    [NEW_REQUEST]: newRequestHandler,
    [REFETCH_CHAT]: refetchHandler,
    [ONLINE_USERS]: onlineUserHandler,
  };

  useSocketEvents(socket, eventHandlers);
  useEffect(() => {
    getFromStorage({ key: NEW_MESSAGE_ALLERT, val: newMessageAllert });
  }, [newMessageAllert]);
  console.log(data?.chats?.length);
  return (
    <>
      <Title />
      <Header />
      <DeleteChatMenu dispatch={dispatch} deleteMenuAnchor={deleteMenuAnchor} />
      {isLoading ? (
        <Skeleton />
      ) : (
        <Drawer open={isMobileMenu} onClose={handleMobileMenuClose}>
          <ChatList
            w="70vw"
            chats={data?.chats}
            chatId={chatId}
            handleDeleteChat={handleDeleteChat}
            newMessageAllert={newMessageAllert}
            onlineUsers={onLineUsers}
          />
        </Drawer>
      )}
      <Grid2 container height="calc(100vh - 4rem)">
        <Grid2
          item
          size={{ xs: 4, md: 3 }}
          sx={{ display: { xs: "none", sm: "block" } }}
          height={"100%"}
        >
          {isLoading ? (
            <Skeleton />
          ) : (
            <ChatList
              chats={data?.chats}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessageAllert={newMessageAllert}
              onlineUsers={onLineUsers}
            />
          )}
        </Grid2>
        <Grid2 item size={{ xs: 12, sm: 8, md: 5, lg: 6 }} height={"100%"}>
          <Outlet />
        </Grid2>
        <Grid2
          item
          size={{ md: 4, lg: 3 }}
          sx={{
            display: { xs: "none", md: "block" },
            padding: "2rem",
            bgcolor: "rgba(0, 0, 0, 0.85)",
          }}
          height={"100%"}
        >
          <Profile user={user} />
        </Grid2>
      </Grid2>
    </>
  );
};

export default AppLayout;
