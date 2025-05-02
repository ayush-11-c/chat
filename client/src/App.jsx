import { BrowserRouter, Routes, Route } from "react-router-dom";

import { lazy, Suspense, useEffect } from "react";
import ProtectRoute from "./components/auth/ProtectRoute";
import AppLayout from "./components/layout/AppLayout";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { userExist, userNotExist } from "./redux/reducers/auth";
import { server } from "./constants/config";
import { LayoutLoader } from "./components/layout/Loaders";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./socket";
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Group = lazy(() => import("./pages/Group"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ChatManagement = lazy(() => import("./pages/admin/ChatManagement"));
const MessageManagement = lazy(() => import("./pages/admin/MessageManagement"));

const App = () => {
  const { user, loader } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    axios
      .get(`${server}/api/v1/user/me`, { withCredentials: true })
      .then(({ data }) => dispatch(userExist(data.user)))
      .catch((err) => dispatch(userNotExist()));
  }, [dispatch]);
  return loader ? (
    <LayoutLoader />
  ) : (
    <BrowserRouter>
      <SocketProvider>
        <Suspense fallback={<LayoutLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectRoute user={user}>
                  <AppLayout />
                </ProtectRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="chat/:chatId" element={<Chat />} />
            </Route>
            <Route
              path="/group"
              element={
                <ProtectRoute user={user}>
                  <Group />
                </ProtectRoute>
              }
            />

            <Route
              path="/login"
              element={
                <ProtectRoute user={!user} redirect="/">
                  <Login />
                </ProtectRoute>
              }
            />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/chats" element={<ChatManagement />} />
            <Route path="/admin/messages" element={<MessageManagement />} />
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </Suspense>
        <Toaster />
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;
