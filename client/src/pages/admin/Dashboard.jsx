import { useFetchData } from "6pp";
import {
  AdminPanelSettings,
  Group,
  Message,
  Person,
} from "@mui/icons-material";
import { Container, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import AdminLayout from "../../components/layout/AdminLayout";
import { DonutChart, LineChart } from "../../components/specific/Charts";
import {
  CurveButton,
  SearchFeild,
} from "../../components/styles/StyledComponent";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import axios from "axios";
import { useEffect, useState } from "react";
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [err, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/api/v1/admin/stats`, {
        withCredentials: true,
      });
      setData(data);
    } catch (error) {
      console.log(error);
      setError(error.response.data.message || error.message);
    } finally {
      setLoading(false);
    }
  };
  const { stats } = data || {};
  useErrors([
    {
      isError: err,
      error: err,
    },
  ]);
  useEffect(() => {
    fetchData();
  }, []);
  const Appbar = (
    <Paper
      elevation={3}
      sx={{ padding: "2rem", margin: "2rem 0", borederRadius: "2rem" }}
    >
      <Stack direction="row" alignItems={"center"} spacing={"1rem"}>
        <AdminPanelSettings sx={{ fontSize: "3rem" }} />
        <SearchFeild />
        <CurveButton>Search</CurveButton>
        <Box flexGrow={1} />
        <Typography>{moment().format("MMMM Do YYYY,h:mm:ss a")}</Typography>
      </Stack>
    </Paper>
  );
  const Widgets = (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={"2rem"}
      justifyContent={"space-between"}
      alignItems={"center"}
      margin={"2rem 0"}
    >
      <Widget title={"Users"} value={stats?.usersCount} Icon={<Person />} />
      <Widget title={"Chats"} value={stats?.totalChatsCount} Icon={<Group />} />
      <Widget
        title={"Messages"}
        value={stats?.messagesCount}
        Icon={<Message />}
      />
    </Stack>
  );

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton />
      ) : (
        <Container component={"main"}>
          {Appbar}
          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            sx={{ gap: "2rem" }}
            flexWrap={"wrap"}
            justifyContent={"center"}
            alignItems={{
              xs: "center",
              lg: "flex-start",
            }}
          >
            <Paper
              elevation={3}
              sx={{
                padding: "2rem 3.5rem",
                borderRadius: "1rem",
                width: "100%",
                maxWidth: "45rem",
              }}
            >
              <Typography margin={"2rem 0"}>Last Messages</Typography>
              <LineChart value={stats?.messagesChart || []} />
            </Paper>
            <Paper
              elevation={3}
              sx={{
                padding: "1rem",
                borderRadius: "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: { xs: "100%", sm: "50%" },
                position: "relative",

                maxWidth: "25rem",
              }}
            >
              <DonutChart
                labels={["Single Chats", "Group Chats"]}
                value={[
                  stats?.totalChatsCount - stats?.groupsCount || 0,
                  stats?.groupsCount || 0,
                ]}
              />
              <Stack
                position={"absolute"}
                direction={"row"}
                justifyContent={"center"}
                spacing={"0.5rem"}
                width={"100%"}
                height={"100%"}
                alignItems={"center"}
              >
                <Group />
                <Typography>Vs</Typography>
                <Person />
              </Stack>
            </Paper>
          </Stack>
          {Widgets}
        </Container>
      )}
    </AdminLayout>
  );
};
const Widget = ({ title, value, Icon }) => (
  <Paper
    elevation={3}
    sx={{
      padding: "2rem",
      borderRadius: "1rem",
      margin: "2rem 0",
      width: "20rem",
    }}
  >
    <Stack alignItems={"center"} spacing={"1rem"}>
      <Typography
        sx={{
          color: "rgba(0,0,0,0.7)",
          borderRadius: "100%",
          border: "5px solid rgba(0,0,0,9)",
          width: "5rem",
          height: "5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {value}
      </Typography>
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        {Icon}
        <Typography>{title}</Typography>
      </Stack>
    </Stack>
  </Paper>
);
export default Dashboard;
