import { Document, model, Schema, Types } from "mongoose";
import { User } from "./userSchema";

export interface Folder extends Document {
  name: string;
  owner: Types.ObjectId;
  parent: Types.ObjectId;
  access: "private" | "shared" | "public";
  shardwith: Types.ObjectId[] | [];
}

const folderSchema = new Schema<Folder>(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    access: {
      type: String,
      enum: ["private", "shared", "public"],
      default: "private",
    },
    shardwith: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Folder = model<Folder>("Folder", folderSchema);
