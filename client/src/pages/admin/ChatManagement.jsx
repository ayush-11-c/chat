import { useFetchData } from "6pp";
import { Avatar, Skeleton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import AvatarCard from "../../components/shared/AvatarCard";
import Table from "../../components/shared/Table";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "../../lib/features";
import axios from "axios";
const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => <AvatarCard avatar={params.row.avatar} />,
  },

  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 300,
  },

  {
    field: "groupChat",
    headerName: "Group",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "totalMembers",
    headerName: "Total Members",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "members",
    headerName: "Members",
    headerClassName: "table-header",
    width: 400,
    renderCell: (params) => (
      <AvatarCard max={100} avatar={params.row.members} />
    ),
  },
  {
    field: "totalMessages",
    headerName: "Total Messages",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "creator",
    headerName: "Created By",
    headerClassName: "table-header",
    width: 250,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={"1rem"}>
        <Avatar alt={params.row.creator.name} src={params.row.creator.avatar} />
        <span>{params.row.creator.name}</span>
      </Stack>
    ),
  },
];
const ChatManagement = () => {
  // const { loading, data, error } = useFetchData(
  //   `${server}/api/v1/admin/chats`,
  //   "dashboard-chats"
  // );

  // useErrors([
  //   {
  //     isError: error,
  //     error: error,
  //   },
  // ]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [err, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/api/v1/admin/chats`, {
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

  useErrors([
    {
      isError: err,
      error: err,
    },
  ]);
  useEffect(() => {
    fetchData();
  }, []);
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (data) {
      setRows(
        data.chats.map((i) => ({
          ...i,
          id: i._id,
          avatar: i.avatar.map((i) => transformImage(i, 50)),
          members: i.members.map((j) => transformImage(j.avatar, 50)),
          creator: {
            name: i.creator.name,
            avatar: transformImage(i.creator.avatar, 50),
          },
        }))
      );
    }
  }, [data]);
  return (
    <AdminLayout>
      {loading ? (
        <Skeleton />
      ) : (
        <Table heading={"ALL CHATS"} rows={rows} columns={columns} />
      )}
    </AdminLayout>
  );
};

export default ChatManagement;
