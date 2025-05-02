import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";
import { getBase64, getSockets } from "../lib/helper.js";
const cookieOption = {
  maxAge: 2 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: false,
  sameSite: "lax",
};
{
  /*  bad me sahi krna hai secure aur samesite ko */
}
const connectDb = async (uri) => {
  try {
    const data = await mongoose.connect(uri);
    console.log(`Connected to the database ${data.connection.host} `);
  } catch (error) {
    console.error(`Error connecting data base : ${error.message}`);
  }
};

const sendToken = (res, user, code, message) => {
  console.log(process.env.JWT_SECRET);
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  return res.status(code).cookie("chat-cookies", token, cookieOption).json({
    success: true,
    message: message,
    user,
  });
};

const emitEvent = (req, event, user, data) => {
  const io = req.app.get("io");
  console.log("Emitting event:", event);
  console.log(user);

  const usersSocket = getSockets(user);

  io.to(usersSocket).emit(event, data);
};
const deleteFilesFromCloudinary = () => {
  console.log("Deleting files from cloudinary");
};
const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromise = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file || file.path,
        {
          resource_type: "auto",
          public_id: uuid(),
        },

        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
    });
  });
  try {
    const results = await Promise.all(uploadPromise);
    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    console.log("Formatted Results :", formattedResults);
    return formattedResults;
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
    throw new Error("error in uploading files", error);
  }
};
const uploadFilesToCloudinary2 = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    throw new Error("Error uploading files to cloudinary", err);
  }
};

export {
  connectDb,
  sendToken,
  cookieOption,
  emitEvent,
  deleteFilesFromCloudinary,
  uploadFilesToCloudinary,
  uploadFilesToCloudinary2,
};
