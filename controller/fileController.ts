//libraries imports
import { Request, Response } from "express";
import { Types } from "mongoose";
//schema import
import { File } from "../schema/fileSchema";
import { Folder } from "../schema/folderSchema";
import { User } from "../schema/userSchema";
//tools import
import cloudinaryController from "../middlewares/fileUpload";
import { AuthRequest } from "../middlewares/auth";

//creat and upload file
export const uploadFileAPI = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const { folderId } = req.body;
    const userId = authReq.user?._id as Types.ObjectId; // Assuming user ID is available in req.user

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the folder exists
    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    // Upload file to Cloudinary
    const uploadResult: any = await cloudinaryController.uploadImage(
      buffer,
      originalname
    );

    // Save file details in the database
    const newFile = new File({
      name: originalname,
      size,
      type: mimetype,
      path: folderId || null,
      owner: userId,
      access: "private",
      sharedWith: [],
      cloudinaryUrl: uploadResult.secure_url,
    });

    await newFile.save();

    res
      .status(201)
      .json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get file by file ID
export const getFileByIdAPI = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  const user = authReq.user; // Ensure userId is a string

  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ message: "File ID is required" });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 🔹 Check if the user has access to the file
    const hasAccess =
      file.owner.equals(user._id as string) ||
      file.access === "public" ||
      (file.access === "shared" &&
        file.sharedWith?.some((id) => id.equals(user._id as string)));
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ file });
  } catch (error) {
    console.error("Error fetching file by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//share Folder API
export const shareFileAPI = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  try {
    const { fileId, userIds } = authReq.body;
    const user = authReq.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!userIds || userIds.length === 0) {
      return res
        .status(400)
        .json({ error: "No users provided to share the folder with" });
    }

    if (!Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }

    const file = await File.findOne({
      _id: fileId,
      owner: user._id,
    });
    if (!file) {
      return res.status(404).json({ error: "Folder not found" });
    }
    const validUserIds = userIds.filter((id: string) =>
      Types.ObjectId.isValid(id)
    );
    const existingUsers = await User.find({ _id: { $in: validUserIds } });

    if (existingUsers.length !== validUserIds.length) {
      return res
        .status(400)
        .json({ error: "Some user IDs are invalid or do not exist" });
    }

    if (file.access === "private") {
      file.access = "shared";
    }

    file.sharedWith = Array.from(
      new Set([...(file.sharedWith || []), ...validUserIds])
    );

    await file.save();

    res.status(200).json({ message: "File shared successfully", file });
  } catch (error) {
    res.status(500).json({ error });
  }
};
