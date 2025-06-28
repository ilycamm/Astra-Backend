import { Schema, model } from "mongoose";

interface IUser {
  accountId: string;
  email: string;
  password: string;
  username: string;
  banned: boolean;
  created: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  accountId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  banned: { type: Boolean, required: false, unique: true },
  created: { type: Date, required: true, unique: true },
});

const User = model<IUser>("Users", UserSchema);

export default User;
