import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import { IconButton, Skeleton, Stack } from "@mui/material";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import FileMenu from "../components/dialogs/FileMenu";
import { TypingLoader } from "../components/layout/Loaders";
import MessageComponent from "../components/shared/MessageComponent";
import { InputBox } from "../components/styles/StyledComponent";
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEFT,
  NEW_MESSAGEs,
  START_TYPING,
  STOP_TYPING,
} from "../constants/event";
import { useErrors, useSocketEvents } from "../hooks/hook";
import { useGetChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { removeNewMessageAllertt } from "../redux/reducers/chat";
import { setIsFileMenu } from "../redux/reducers/misc";
import { SocketContext } from "../socket";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const { user } = useSelector((state) => state.auth);
  const { chatId } = useSelector((state) => state.misc);
  const [message, setMessage] = useState("");

  const [userTyping, setUserTyping] = useState(false);
  const [IamTyping, setIamTyping] = useState(false);
  const typingTimeout = useRef(null);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [page, setPage] = useState(1);

  const chatDetail = useGetChatDetailsQuery({ chatId, skip: !chatId });

  const member = chatDetail?.data?.chat?.members;
  const { data, isFetching, error, isError } = useGetMessagesQuery({
    chatId,
    page,
  });

  useEffect(() => {
    if (!data) return;
    const scrollE1 = containerRef.current;
    if (!scrollE1) return;

    const prevScrollHeight = scrollE1.scrollHeight;
    setAllMessages((prev) => {
      const all = [...[...data.messages], ...prev];
      const uniqueMessages = [];

      const seen = new Set();
      for (const msg of all) {
        if (!seen.has(msg._id)) {
          seen.add(msg._id);
          uniqueMessages.push(msg);
        }
      }

      return uniqueMessages;
    });

    setTimeout(() => {
      if (scrollE1) {
        const newScrollHeight = scrollE1.scrollHeight;
        scrollE1.scrollTop = newScrollHeight - prevScrollHeight;
      }
    }, 0);
    if (page >= data.totalPages) {
      setHasMore(false);
    }
  }, [data, page]);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop <= 10 && hasMore && !isFetching) {
        setPage((prev) => prev + 1);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFetching]);
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages]);
  useEffect(() => {
    if (chatDetail.isError) return navigate("/");
  }, [chatDetail.isError, navigate]);
  useEffect(() => {
    if (!chatDetail.data?.chat) {
      return navigate("/");
    }
  }, [chatDetail.data?.chat, navigate]);
  const errors = [
    { isError: chatDetail.isError, error: chatDetail.error },
    {
      isError,
      error,
    },
  ];

  const submitHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit(NEW_MESSAGEs, { chatId, member, message });
    setMessage("");
  };
  const handleFileOpen = (e) => {
    setFileMenuAnchor(e.currentTarget);
    dispatch(setIsFileMenu(true));
  };

  const newMessageListner = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setAllMessages((prev) => {
        if (prev.some((msg) => msg._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
    },
    [chatId]
  );
  const members = chatDetail?.data?.chat?.members;

  const messageOnChange = (e) => {
    setMessage(e.target.value);
    if (!IamTyping) {
      socket.emit(START_TYPING, { chatId, members });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { chatId, members });
      setIamTyping(false);
    }, [2000]);
  };
  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );
  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "ayush_made_this",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setAllMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGEs]: newMessageListner,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };
  useSocketEvents(socket, eventHandler);
  useErrors(errors);
  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessageAllertt({ chatId }));
    return () => {
      setAllMessages([]);
      setPage(1);
      setHasMore(true);
      socket.emit(CHAT_LEFT, { userId: user._id, members });
    };
  }, [chatId, dispatch, socket, user._id, members]);

  return chatDetail.isLoading ? (
    <Skeleton />
  ) : (
    <Fragment>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={"rgba(0, 0, 0, 0.85)"}
        height={"90%"}
        borderLeft={"2px solid #f9f9f9"}
        borderRight={"2px solid #f9f9f9"}
        sx={{ overflowX: "hidden", overflowY: "auto" }}
      >
        {allMessages.map((i) => (
          <MessageComponent key={i._id} user={user} message={i} />
        ))}

        {userTyping && <TypingLoader />}
        <div ref={bottomRef} />
      </Stack>
      <form
        onSubmit={submitHandler}
        style={{
          height: "10%",
          background: "rgba(0, 0, 0, 0.81)",
          border: "2px solid #f9f9f9",
        }}
      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          <IconButton
            sx={{
              ":hover": {
                color: "#f9f9f9",
                background: "rgba(0, 0, 0, 0.85)",
              },
              marginRight: "1rem",
              padding: "0.5rem",
              color: "rgba(0, 0, 0, 0.85)",
              background: "#f9f9f9",
            }}
            onClick={handleFileOpen}
          >
            <AttachFileIcon />
          </IconButton>
          <InputBox
            placeholder="Type Your Message"
            value={message}
            onChange={messageOnChange}
          />
          <IconButton
            type="submit"
            sx={{
              ":hover": {
                color: "#f9f9f9",
                background: "rgba(0, 0, 0, 0.85)",
              },
              marginLeft: "1rem",
              padding: "0.5rem",
              color: "rgba(0, 0, 0, 0.85)",
              background: "#f9f9f9",
            }}
          >
            <SendIcon />
          </IconButton>
          <FileMenu anchor={fileMenuAnchor} chatId={chatId} />
        </Stack>
      </form>
    </Fragment>
  );
};

export default Chat;
