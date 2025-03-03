import { Document, model, Schema } from "mongoose";
import { User } from "./user";

export interface Folder extends Document {
  name: String;
  owner: User["_id"];
  parent: Folder["_id"];
  access: "private" | "shared" | "public";
  shardwith: User["_id"][] | [];
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
      type: String,
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
