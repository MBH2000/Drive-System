import { Response, Request } from "express";
import { AuthRequest } from "../middlewares/auth";
import { Folder } from "../schema/folderSchema";
import { Types } from "mongoose";
import { User } from "../schema/userSchema";

export const createFolder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const folder = new Folder({
      name: req.body.name,
      owner: authReq.user._id,
      parent: req.body.parent || null,
      access: req.body.access || "private",
    });
    await folder.save();
    res.status(201).send(folder);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getFolder = async (req: Request, res: Response): Promise<any> => {
  const authReq = req as AuthRequest;
  try {
    
    
    const { folderId } = authReq.params; // Use params instead of body
    console.log(folderId);
    const user = authReq.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate `folderId`
    if (!Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }

    // Find the folder
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Check if the user has access
    const hasAccess =
      folder.owner.equals(user._id as string) ||
      folder.access === "public" ||
      (folder.access === "shared" &&
        folder.sharedWith?.some((id) => id.equals(user._id as string)));

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(folder);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const shareFolder = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  try {
    const { folderId, userIds } = authReq.body;
    const user = authReq.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!userIds || userIds.length === 0) {
      return res
        .status(400)
        .json({ error: "No users provided to share the folder with" });
    }

    if (!Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    if (!folder.owner.equals(user._id as string)) {
      return res
        .status(403)
        .json({ error: "Access denied: Only the owner can share this folder" });
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

    if (folder.access === "private") {
      folder.access = "shared";
    }

    folder.sharedWith = Array.from(
      new Set([...(folder.sharedWith || []), ...validUserIds])
    );

    await folder.save();

    res.status(200).json({ message: "Folder shared successfully", folder });
  } catch (error) {
    res.status(500).json({ error });
  }
};
