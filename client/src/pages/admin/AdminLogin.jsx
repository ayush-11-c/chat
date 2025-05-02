import { Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { adminLogin, getAdmin } from "../../redux/thunks/admin";

const AdminLogin = () => {
  const { isAdmin } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [secretKey, setSecretKey] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(adminLogin(secretKey));
  };
  useEffect(() => {
    dispatch(getAdmin()), [dispatch];
  });
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" />;
  }

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
          <>
            <Typography variant="h5" fontSize={"2rem"}>
              Login
            </Typography>
            <form
              style={{ width: "100%", marginTop: "1rem" }}
              onSubmit={submitHandler}
            >
              <TextField
                label="Secret Key"
                fullWidth
                margin="normal"
                required
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
              <Button
                sx={{ marginTop: "1rem" }}
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Login
              </Button>
            </form>
          </>
        </Paper>
      </Container>
    </div>
  );
};

export default AdminLogin;
