
import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user.interface";

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "User" }
);

export const User = mongoose.model<IUser>("User", UserSchema);