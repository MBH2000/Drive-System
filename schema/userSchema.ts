import { Document, Model, model, Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
export interface User extends Document {
  name: string;
  email: string;
  password: string;
  token?: string;
  team: string;
  comp: Types.ObjectId;
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
      validate: {
        validator: function (value: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    team: {
      type: String,
      required: true,
    },
    comp: {
      type: Schema.Types.ObjectId,
      ref: "company",
      required: true,
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
