import CameraAltIcon from "@mui/icons-material/CameraAlt";
import {
  Avatar,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { VisuallyHiddenInput } from "../components/styles/StyledComponent";
import axios from "axios";
import { server } from "../constants/config";
import { useDispatch } from "react-redux";
import { userExist } from "../redux/reducers/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    avatar: null, // file object
    avatarPreview: "", // base64 or object URL
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleAdminLogin = () => navigate("/admin");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/login`,
        { username: formData.username, password: formData.password },
        config
      );

      dispatch(userExist(data.user));

      toast.success(data.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    // formDataToSend.append("confirmPassword", formData.confirmPassword);
    formDataToSend.append("bio", formData.bio);
    formDataToSend.append("avatar", formData.avatar);
    formDataToSend.append("name", formData.name);
    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    console.log("formdata to send :", formDataToSend.get("avatar"));
    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/new`,
        formDataToSend,
        config
      );
      console.log(data);
      dispatch(userExist(data.user));
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(6,6,37,1) 35%, rgba(0,212,255,1) 100%)",
      }}
    >
      <Container
        component={"main"}
        maxWidth="xs"
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 4,
          }}
        >
          {isLogin ? (
            <>
              <Typography variant="h5" fontSize={"2rem"}>
                Login
              </Typography>
              <form
                style={{ width: "100%", marginTop: "1rem" }}
                onSubmit={handleLogin}
              >
                <TextField
                  label="Username"
                  fullWidth
                  margin="normal"
                  required
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
                <TextField
                  label="Password"
                  fullWidth
                  margin="normal"
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <Button
                  sx={{ marginTop: "1rem" }}
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  Login
                </Button>
                <Typography textAlign={"center"} m={"1rem"}>
                  Or
                </Typography>
                <Button
                  sx={{ marginTop: "0.5rem" }}
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={isLoading}
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </Button>
              </form>
            </>
          ) : (
            <>
              <Typography variant="h5" fontSize={"2rem"}>
                Register
              </Typography>
              <form
                style={{ width: "100%", marginTop: "1rem" }}
                onSubmit={handleSignup}
              >
                <Stack position={"relative"} width={"10rem"} margin={"auto"}>
                  <Avatar
                    sx={{
                      width: "10rem",
                      height: "10rem",
                      objectFit: "contain",
                    }}
                    src={formData.avatarPreview}
                  />

                  <IconButton
                    sx={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      hover: { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                    component="label"
                  >
                    <CameraAltIcon />
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData((prev) => ({
                              ...prev,
                              avatar: file,
                              avatarPreview: reader.result, // for preview only
                            }));
                          };
                          reader.readAsDataURL(file); // just for preview, not upload
                        }
                      }}
                    />
                  </IconButton>
                </Stack>

                <TextField
                  label="Username"
                  fullWidth
                  margin="normal"
                  required
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
                <TextField
                  label="name"
                  fullWidth
                  margin="normal"
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <TextField
                  label="Password"
                  fullWidth
                  margin="normal"
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <TextField
                  label="Confirm Password"
                  fullWidth
                  margin="normal"
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <TextField
                  label="Bio"
                  fullWidth
                  margin="normal"
                  required
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />

                <Button
                  sx={{ marginTop: "1rem" }}
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  Register
                </Button>
                <Typography textAlign={"center"} m={"1rem"}>
                  Or
                </Typography>
                <Button
                  sx={{ marginTop: "0.5rem" }}
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => setIsLogin(true)}
                  disabled={isLoading}
                >
                  Login
                </Button>
              </form>
            </>
          )}
          <Button
            sx={{ marginTop: "1rem" }}
            type="submit"
            variant="contained"
            color="error"
            fullWidth
            disabled={isLoading}
            onClick={() => {
              handleAdminLogin();
            }}
          >
            Admin Login
          </Button>
        </Paper>
      </Container>
    </div>
  );
};

export default Login;
