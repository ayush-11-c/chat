import { ListItemText, Menu, MenuItem, MenuList, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu, setUploadingLoader } from "../../redux/reducers/misc";
import ImageIcon from "@mui/icons-material/Image";
import { useRef } from "react";
import { AudioFile, FileUpload, VideoCameraBack } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useSendAttachmentsMutation } from "../../redux/api/api";
const FileMenu = ({ anchor, chatId }) => {
  const dispatch = useDispatch();
  const { isFileMenu } = useSelector((state) => state.misc);
  const [sendAttachments] = useSendAttachmentsMutation();
  const imgRef = useRef(null);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const selectImage = () => imgRef.current?.click();
  const selectAudio = () => audioRef.current?.click();
  const selectVideo = () => videoRef.current?.click();
  const selectFile = () => fileRef.current?.click();
  const closeFileMenu = () => dispatch(setIsFileMenu(false));
  const fileChangeHandler = async (e, key) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    dispatch(setUploadingLoader(true));
    const toastId = toast.loading("Uploading files...");
    closeFileMenu();
    try {
      const newFormdata = new FormData();
      newFormdata.append("chatId", chatId);
      files.forEach((file) => {
        newFormdata.append("files", file);
      });
      const res = await sendAttachments(newFormdata).unwrap();
      console.log("res", res);
      if (res.message) {
        toast.success("Files uploaded successfully", {
          id: toastId,
        });
      } else {
        toast.error("Error uploading files", {
          id: toastId,
        });
      }
    } catch (error) {
      console.log("Error uploading files", error);
      toast.error(error?.data?.message || error?.message || "Upload failed", {
        id: toastId,
      });
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };
  return (
    <Menu onClose={closeFileMenu} open={isFileMenu} anchorEl={anchor}>
      <div style={{ width: "10rem" }}>
        <MenuList>
          <MenuItem onClick={selectImage}>
            <Tooltip title="Image">
              <ImageIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Image</ListItemText>
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/gif"
              ref={imgRef}
              onChange={(e) => fileChangeHandler(e, "image")}
              style={{ display: "none" }}
            />
          </MenuItem>
          <MenuItem onClick={selectAudio}>
            <Tooltip title="Audio">
              <AudioFile />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Audio</ListItemText>
            <input
              type="file"
              multiple
              accept="audio/mpeg, audio/wav"
              ref={audioRef}
              onChange={(e) => fileChangeHandler(e, "audio")}
              style={{ display: "none" }}
            />
          </MenuItem>
          <MenuItem onClick={selectVideo}>
            <Tooltip title="Video">
              <VideoCameraBack />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Video</ListItemText>
            <input
              type="file"
              multiple
              accept="video/mp4, video/mkv"
              ref={videoRef}
              onChange={(e) => fileChangeHandler(e, "video")}
              style={{ display: "none" }}
            />
          </MenuItem>
          <MenuItem onClick={selectFile}>
            <Tooltip title="File">
              <FileUpload />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>File</ListItemText>
            <input
              type="file"
              multiple
              accept="*"
              ref={fileRef}
              onChange={(e) => fileChangeHandler(e, "file")}
              style={{ display: "none" }}
            />
          </MenuItem>
        </MenuList>
      </div>
    </Menu>
  );
};
export default FileMenu;
