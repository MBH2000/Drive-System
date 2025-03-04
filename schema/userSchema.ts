import { Document, Model, model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
interface User extends Document {
  name: string;
  email: string;
  password: string;
  token: string;
}
interface UserMethods {
  generateToken(): string;
  Loginuser(): User;
}
type UserModel = Model<User, {}, UserMethods>;

const userSchema = new Schema<User, UserMethods, UserModel>(
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
    token: String,
  },
  {
    timestamps: true,
  }
);
userSchema.methods.generateToken = async function (): Promise<string> {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.PASSWORD as string
  );
  user.token = token;
  await user.save();
  return token;
};

userSchema.statics.Loginuser = async function (
  email: string,
  password: string
): Promise<User> {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email not found");
  }
  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) {
    throw new Error("Incorrect password");
  }
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
export const User = model<User, UserModel>("User", userSchema);
