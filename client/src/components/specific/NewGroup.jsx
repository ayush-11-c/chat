import {
  Dialog,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useAvailableFriendsQuery,
  useNewGroupMutation,
} from "../../redux/api/api";
import { setIsNewGroup } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";
const NewGroup = () => {
  const dispatch = useDispatch();
  const { isError, isLoading, error, data } = useAvailableFriendsQuery();

  const [newGroup, isLoadingNewGroup] = useAsyncMutation(useNewGroupMutation);
  const [groupName, setGroupName] = useState("");
  const isLoadingSet = false;

  const { isNewGroup } = useSelector((state) => state.misc);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const selectedMembersHandler = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((member) => member !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };
  const submitHandler = () => {
    if (!groupName) return toast.error("Group name is required");
    if (selectedMembers.length < 2)
      return toast.error("Select at least 3 member");

    newGroup("Creating New Group", {
      name: groupName,
      members: selectedMembers,
    });
    closeHandler();
  };
  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
  };
  const cleanFriend = Array.from(
    new Map(
      (data?.friends || [])
        .filter((friend) => friend !== null)
        .map((friend) => [friend._id, friend])
    ).values()
  );

  console.log(data, isLoading, isError, error);
  console.log("clean", cleanFriend);

  return (
    <Dialog open={isNewGroup} onClose={closeHandler}>
      <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}>
        <DialogTitle>New Group</DialogTitle>
        <TextField
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Typography variant="body1">Select Members</Typography>
        <Stack>
          {isLoading ? (
            <Skeleton />
          ) : (
            cleanFriend.map((user) => (
              <UserItem
                user={user}
                key={user._id}
                isAdded={selectedMembers.includes(user._id)}
                handler={selectedMembersHandler}
                handlerIsloading={isLoadingSet}
              />
            ))
          )}
        </Stack>
        <Stack direction={{ sm: "row", xs: "column" }} spacing={"1rem"}>
          <Button
            variant="contained"
            onClick={submitHandler}
            disabled={isLoadingNewGroup}
          >
            Create
          </Button>
          <Button color="error" onClick={closeHandler}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default NewGroup;
