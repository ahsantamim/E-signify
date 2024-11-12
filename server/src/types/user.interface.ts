
import { Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}
