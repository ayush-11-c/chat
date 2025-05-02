import multer from "multer";

const multerUpload = multer({
  limits: { fileSize: 50 * 1024 * 1024 },
});

export { multerUpload };
