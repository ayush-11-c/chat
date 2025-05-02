import SearchIcon from "@mui/icons-material/Search";
import {
  DialogTitle,
  InputAdornment,
  List,
  Stack,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
} from "../../redux/api/api";
import { setIsSearch } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";

const Search = () => {
  const { isSearch } = useSelector((state) => state.misc);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searchUser] = useLazySearchUserQuery();
  const [sendFriendRequest, isLoadingSet] = useAsyncMutation(
    useSendFriendRequestMutation
  );
  const addFriendHandler = async (id) => {
    sendFriendRequest("Sending Friend Request...", { userId: id });
  };
  const searchCloseHandler = () => dispatch(setIsSearch(false));
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      searchUser(search)
        .then(({ data }) => setUsers(data.users))
        .catch((err) => console.log(err));
    }, 1000);
    return () => clearTimeout(timeOutId);
  }, [searchUser, search]);

  return (
    <Dialog open={isSearch} onClose={searchCloseHandler}>
      <Stack p={"2rem"} direction={"column"} width="25rem">
        <DialogTitle textAlign={"center"}>Search</DialogTitle>
        <TextField
          label=""
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <List>
          {users.map((user) => (
            <UserItem
              user={user}
              key={user._id}
              handler={addFriendHandler}
              handlerIsloading={isLoadingSet}
            />
          ))}
        </List>
      </Stack>
    </Dialog>
  );
};

export default Search;
