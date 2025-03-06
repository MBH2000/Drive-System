import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../schema/userSchema";
import dotenv from "dotenv";

dotenv.config();

// Extend Request Type
export interface AuthRequest extends Request {
  user: User;
  token?: string;
}

// **Middleware: Verify Token**
async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const authReq = req as AuthRequest;
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.PASSWORD as string
    ) as JwtPayload;
    const user = await User.findOne({ _id: decoded._id, token });

    if (!user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    authReq.token = token;
    authReq.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Unauthorized" });
  }
}

export default verifyToken;
