import { Document, model, Schema } from "mongoose";

export interface User extends Document {
  name: String;
  email: String;
  password: String;
}

const useSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<User>("User", useSchema);
