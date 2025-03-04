import { Document, model, Schema, Types } from "mongoose";
import { User } from "./userSchema";

export interface File extends Document {
  name: string;
  size: Number;
  type: string;
  path: string;
  owner: Types.ObjectId;
  access: "private" | "shared" | "public";
  shardwith: Types.ObjectId[] | [];
  cloudinaryUrl: string;
}

const fileSchema = new Schema<File>(
  {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    cloudinaryUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const File = model<File>("File", fileSchema);
