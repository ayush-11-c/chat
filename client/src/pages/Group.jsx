/* eslint-disable react/prop-types */
import { ArrowBack, Done, Edit, Menu } from "@mui/icons-material";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Drawer,
  Grid2,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddMemberDialog from "../components/dialogs/AddMemberDialog";
import ConfirmDeleteDialog from "../components/dialogs/ConfirmDeleteDialog";
import AvatarCard from "../components/shared/AvatarCard";
import { Link } from "../components/styles/StyledComponent";

import { useDispatch, useSelector } from "react-redux";
import { LayoutLoader } from "../components/layout/Loaders";
import UserItem from "../components/shared/UserItem";
import { useAsyncMutation, useErrors } from "../hooks/hook";
import {
  useDeleteChatMutation,
  useGetChatDetailsQuery,
  useMyGroupsQuery,
  useRemoveGroupMemberMutation,
  useRenameGroupMutation,
} from "../redux/api/api";
import { setIsAddMember } from "../redux/reducers/misc";

const Group = () => {
  const dispatch = useDispatch();
  const { isAddMember } = useSelector((state) => state.misc);
  const chatId = useSearchParams()[0].get("group");

  const [isEdit, setIsEdit] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const navigateBack = () => {
    navigate("/");
  };
  const myGroups = useMyGroupsQuery();
  const groupDetails = useGetChatDetailsQuery(
    { chatId, populate: true },
    {
      skip: !chatId,
    }
  );
  const [updateGroupNamee, isLoadingGroupName] = useAsyncMutation(
    useRenameGroupMutation
  );
  const [removeMember, isLoadingRemoveMember] = useAsyncMutation(
    useRemoveGroupMemberMutation
  );
  const [deleteGroup, isLoadingDeleteGroup] = useAsyncMutation(
    useDeleteChatMutation
  );

  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);

  const errors = [
    {
      isError: myGroups.isError,
      error: myGroups.error,
    },
    {
      isError: groupDetails.isError,
      error: groupDetails.error,
    },
  ];
  useErrors(errors);

  const openAddMemberHandler = () => {
    dispatch(setIsAddMember(true));
    console.log("Add Member");
  };
  const openConfirmDeleteHandler = () => {
    setConfirmDeleteDialog(true);
  };
  const removeMemberHandler = (userId) => {
    removeMember("removeGroupMember", {
      chatId,
      userId,
    });
    console.log("Remove Member");
  };
  const closeConfirmDeleteHandler = () => {
    setConfirmDeleteDialog(false);
  };
  const handleMobile = () => {
    setMobileMenuOpen((prev) => !prev);
  };
  const handleMobileClose = () => {
    setMobileMenuOpen(false);
  };
  const deleteHandler = () => {
    deleteGroup("deleteGroup", chatId);
    closeConfirmDeleteHandler();
    navigate("/group");
  };
  const [groupName, setGroupName] = useState("");
  const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");
  const updateGroupName = () => {
    setIsEdit(false);
    updateGroupNamee("updateGroupName", {
      chatId,
      name: groupNameUpdatedValue,
    });
  };
  const [members, setMembers] = useState([]);
  useEffect(() => {
    const groupData = groupDetails?.data?.chat;
    if (groupData) {
      setGroupName(groupData.name);
      setGroupNameUpdatedValue(groupData.name);
      setMembers(groupData.members);
    }
    return () => {
      setGroupName("");
      setGroupNameUpdatedValue("");
      setIsEdit(false);
    };
  }, [groupDetails?.data?.chat]);
  const ButtonGroup = (
    <Stack
      direction={{ xs: "column-reverse", sm: "row" }}
      spacing={"1rem"}
      p={{ xs: "0", sm: "1rem", md: "1rem 4rem" }}
    >
      <Button
        variant="contained"
        size="large"
        color="error"
        onClick={openConfirmDeleteHandler}
      >
        Delete Group
      </Button>
      <Button
        variant="contained"
        size="large"
        color="primary"
        onClick={openAddMemberHandler}
      >
        Add Member
      </Button>
    </Stack>
  );

  const GroupName = (
    <Stack
      direction={"row"}
      spacing={"1rem"}
      alignItems={"center"}
      padding={"3rem"}
      justifyContent={"center"}
    >
      {isEdit ? (
        <>
          <TextField
            value={groupNameUpdatedValue}
            onChange={(e) => setGroupNameUpdatedValue(e.target.value)}
          />
          <IconButton onClick={updateGroupName} disabled={isLoadingGroupName}>
            <Done />
          </IconButton>
        </>
      ) : (
        <>
          <Typography variant="h6">{groupName} </Typography>
          <IconButton
            onClick={() => setIsEdit((prev) => !prev)}
            disabled={isLoadingGroupName}
          >
            <Edit />
          </IconButton>
        </>
      )}
    </Stack>
  );
  const IconBtns = (
    <>
      <Box
        sx={{
          display: {
            xs: "block",
            sm: "none",
            position: "fixed",
            right: "1rem",
            top: "1rem",
          },
        }}
      >
        <Tooltip title="Menu">
          <IconButton onClick={handleMobile}>
            <Menu />
          </IconButton>
        </Tooltip>
      </Box>
      <Tooltip title="Back">
        <IconButton
          sx={{
            position: "absolute",
            top: "2rem",
            left: "2rem",
            bgcolor: "#676666",
            color: "rgba(0,0,0,0.85)",
            ":hover": {
              color: "#f9f9f9",
              bgcolor: "rgba(0,0,0,0.85)",
            },
          }}
          onClick={navigateBack}
        >
          <ArrowBack />
        </IconButton>
      </Tooltip>
    </>
  );
  return myGroups.isLoading ? (
    <LayoutLoader />
  ) : (
    <Grid2 container height={"100vh"}>
      <Grid2
        item
        sx={{ display: { xs: "none", sm: "block" }, bgcolor: "gray" }}
        sm={4}
      >
        <GroupList
          myGroups={myGroups?.data?.groups}
          chatId={chatId}
          w={"50%"}
        />
      </Grid2>
      <Grid2
        item
        xs={12}
        sm={8}
        sx={{
          display: "flex",
          position: "relative",
          alignItems: "center",
          flexDirection: "column",
          padding: "1rem 3rem ",
        }}
      >
        {IconBtns}
        {groupName && (
          <>
            <Typography>{GroupName}</Typography>
            <Typography
              variant="body1"
              margin={"2rem"}
              alignSelf={"flex-start"}
              fontWeight={"bold"}
              fontSize={"1.5rem"}
              color={"#f9f9f9"}
              textTransform={"uppercase"}
              padding={"0.5rem"}
              bgcolor={"rgba(0,0,0,0.85)"}
              borderRadius={"0.5rem"}
              width={"fit-content"}
              marginLeft={"4.5rem"}
            >
              Members
            </Typography>
            <Stack
              maxWidth={"45rem"}
              width={"100%"}
              boxSizing={"border-box"}
              padding={{ xs: "0", sm: "1rem", md: "1rem 4rem" }}
              spacing={"2rem"}
              height={"50vh"}
              overflow={"auto"}
            >
              {isLoadingRemoveMember ? (
                <CircularProgress />
              ) : (
                members.map((i) => (
                  <UserItem
                    key={i._id}
                    user={i}
                    isAdded={true}
                    styling={{
                      boxShadow: "0  0 0.5rem rgba(0,0,0,1)",
                      padding: "1rem 2rem",
                      borderRadius: "0.5rem",
                    }}
                    handler={removeMemberHandler}
                  />
                ))
              )}
            </Stack>
            {ButtonGroup}
          </>
        )}
      </Grid2>
      {isAddMember && (
        <Suspense fallback={<Backdrop open />}>
          <AddMemberDialog chatId={chatId} />
        </Suspense>
      )}
      {confirmDeleteDialog && (
        <Suspense fallback={<Backdrop open />}>
          <ConfirmDeleteDialog
            open={confirmDeleteDialog}
            handleClose={closeConfirmDeleteHandler}
            deleteHandler={deleteHandler}
          />
        </Suspense>
      )}
      <Drawer
        sx={{ display: { xs: "block", sm: "none" } }}
        open={isMobileMenuOpen}
        onClose={handleMobileClose}
      >
        <GroupList
          w={"50vw"}
          myGroups={myGroups?.data?.groups}
          chatId={chatId}
        />
      </Drawer>
    </Grid2>
  );
};

const GroupItem = ({ group, chatId }) => {
  const { name, avatar, _id } = group;
  return (
    <Link to={`?group=${_id}`}>
      <Stack
        direction={"row"}
        spacing={"1rem"}
        alignItems={"center"}
        onClick={(e) => {
          if (chatId === _id) e.preventDefault();
        }}
      >
        <AvatarCard avatar={avatar} />
        <Typography variant="h6">{name}</Typography>
      </Stack>
    </Link>
  );
};
const GroupList = ({ myGroups = [], chatId, w = "100%" }) => {
  return (
    <Stack>
      {myGroups.length > 0 ? (
        myGroups.map((group) => (
          <GroupItem key={group._id} group={group} chatId={chatId} />
        ))
      ) : (
        <Typography>No Group Found</Typography>
      )}
    </Stack>
  );
};

export default Group;
