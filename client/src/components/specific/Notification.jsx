/* eslint-disable react/prop-types */
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
} from "@mui/material";

import { Avatar, ListItem, Typography } from "@mui/material";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import {
  useAcceptFriendRequestMutation,
  useGetNotificationQuery,
} from "../../redux/api/api";
import { useDispatch, useSelector } from "react-redux";
import { setIsNotification } from "../../redux/reducers/misc";

const Notification = () => {
  const { isNotification } = useSelector((state) => state.misc);
  const { isLoading, data, isError, error } = useGetNotificationQuery();

  const dispatch = useDispatch();
  const [acceptRequest] = useAsyncMutation(useAcceptFriendRequestMutation);
  const frdReqHandler = async ({ _id, accept }) => {
    dispatch(setIsNotification(false));
    await acceptRequest("Accepting...", { requestId: _id, accept });
    // window.location.reload();
  };
  const handleClose = () => {
    dispatch(setIsNotification(false));
  };
  useErrors([{ isError, error }]);
  return (
    <Dialog open={isNotification} onClose={handleClose}>
      <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}>
        <DialogTitle>Notification</DialogTitle>
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            {data?.allRequest.length > 0 ? (
              data?.allRequest.map(({ sender, _id }) => (
                <NotificationItem
                  sender={sender}
                  _id={_id}
                  handler={frdReqHandler}
                  key={_id}
                />
              ))
            ) : (
              <DialogContent>There are no notifications</DialogContent>
            )}
          </>
        )}
      </Stack>
    </Dialog>
  );
};

const NotificationItem = ({ sender, _id, handler }) => {
  const name = sender?.name;
  const avatar = sender?.avatar;
  console.log(_id);
  return (
    <ListItem
      direction={"row"}
      alignItems="center"
      spacing={"1rem"}
      width={"100%"}
    >
      <Stack
        direction={"row"}
        spacing={"1rem"}
        alignItems="center"
        width={"100%"}
      >
        <Avatar src={avatar} />
        <Typography
          varient="body1"
          sx={{
            flexGlow: 1,
            display: "-webkit-flex",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {`
            ${name} has sent you a friend request
          `}
        </Typography>
        <Stack direction={{ sm: "row", xs: "column" }} spacing={"1rem"}>
          <Button onClick={() => handler({ _id, accept: true })}>Accept</Button>
          <Button color="error" onClick={() => handler({ _id, accept: false })}>
            Reject
          </Button>
        </Stack>
      </Stack>
    </ListItem>
  );
};

export default Notification;
