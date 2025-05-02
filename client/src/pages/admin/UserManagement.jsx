import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { Avatar, Skeleton } from "@mui/material";
import { sampleData4 } from "../../constants/sampleData";
import { transformImage } from "../../lib/features";
import { useFetchData } from "6pp";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
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
    width: 200,
    renderCell: (params) => {
      <Avatar src={params.row.avatar} />;
    },
  },
  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "username",
    headerName: "Username",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "friends",
    headerName: "Friends",
    headerClassName: "table-header",
    width: 150,
  },
  {
    field: "groups",
    headerName: "Groups",
    headerClassName: "table-header",
    width: 200,
  },
];
const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [err, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/api/v1/admin/users`, {
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
        data.users.map((i) => ({
          ...i,
          id: i._id,
          avatar: transformImage(i.avatar),
        }))
      );
    }
  }, [data]);
  return (
    <AdminLayout>
      {loading ? (
        <Skeleton />
      ) : (
        <Table heading={"ALL USERS"} rows={rows} columns={columns} />
      )}
    </AdminLayout>
  );
};

export default UserManagement;
