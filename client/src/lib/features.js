import moment from "moment";

const fileFormat = (url = "") => {
  const type = url.split(".").pop();
  switch (type) {
    case "pdf":
      return "pdf";
    case "doc":
    case "docx":
      return "doc";
    case "xls":
    case "xlsx":
      return "xls";
    case "ppt":
    case "pptx":
      return "ppt";
    case "jpg":
    case "jpeg":
    case "png":
      return "img";
    default:
      return "file";
  }
};

const transformImage = (url = "", width = 100) => {
  if (typeof url !== "string") return "";
  if (!url.includes("upload/")) return url;
  const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`);
  return newUrl;
};
const getLastDays = () => {
  const currD = moment();
  const lastDays = [];
  for (let i = 0; i < 7; i++) {
    lastDays.unshift(currD.format("MMM DD"));
    currD.subtract(1, "days");
  }
  return lastDays;
};

const getFromStorage = ({ key, val, get }) => {
  if (get) {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined") return null;

    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing storage item [${key}]`, error);
      return null;
    }
  } else {
    localStorage.setItem(key, JSON.stringify(val));
  }
};

export { fileFormat, transformImage, getLastDays, getFromStorage };
