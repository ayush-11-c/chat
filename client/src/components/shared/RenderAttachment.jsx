import { FileOpen } from "@mui/icons-material";
import { transformImage } from "../../lib/features";

const RenderAttachment = (file, url) => {
  switch (file) {
    case "video":
      return (
        <video src={url} preload="none" controls style={{ maxWidth: "100%" }} />
      );

    case "img":
      return (
        <img
          src={transformImage(url)}
          alt="attachment"
          style={{ maxWidth: "100%", height: "150px" }}
        />
      );

    case "audio":
      return (
        <audio src={url} preload="none" controls style={{ maxWidth: "100%" }} />
      );

    default:
      return <FileOpen />;
  }
};

export default RenderAttachment;
