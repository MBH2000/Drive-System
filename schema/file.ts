import { Document, model, Schema } from "mongoose";
import { User } from "./user";

export interface File extends Document {
  name: String;
  size: Number;
  type: String;
  path: String;
  owner: User["_id"];
  access: "private" | "shared" | "public";
  shardwith: User["_id"][] | [];
  cloudinaryUrl: String;
  cloudinaryId: String;
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
    cloudinaryId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const File = model<File>("File", fileSchema);
