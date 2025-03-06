import { Request, Response } from "express";
import { File } from "../schema/fileSchema";
import { Folder } from "../schema/folderSchema";
import cloudinaryController from "../middlewares/fileUpload";
import { AuthRequest } from "../middlewares/auth";
import { Types } from "mongoose";

export const uploadFile = async (req: Request, res: Response): Promise<any> => {
  const authReq = req as AuthRequest;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const { folderId } = req.body;
    const userId = authReq.user?.id; // Assuming user ID is available in req.user

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
//get file by folder ID
export const getFilesByFolderId = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  const userId: Types.ObjectId = authReq.user.id; // Get authenticated user ID

  try {
    const { folderId } = req.params;

    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required" });
    }

    // Check if the folder exists
    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Ensure `sharedWith` is treated as an array of strings
    const sharedWithUsers = folder.sharedWith.map((id) => id);

    // 🔹 Check if the user has access to the folder
    const hasAccess =
      folder.owner === userId || sharedWithUsers.includes(userId);

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch all files in the folder
    const files = await File.find({ path: folderId });

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files by folder ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get file by file ID
export const getFileById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  const userId: Types.ObjectId = authReq.user.id; // Ensure userId is a string

  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ message: "File ID is required" });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Ensure sharedWith is an array of strings before checking access
    const sharedWithUsers = file.sharedWith.map((id) => id);

    // 🔹 Check if the user has access to the file
    const hasAccess = file.owner === userId || sharedWithUsers.includes(userId);

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ file });
  } catch (error) {
    console.error("Error fetching file by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
