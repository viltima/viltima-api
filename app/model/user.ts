import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import config from "config";
import bcrypt from "bcrypt";
import { IUser } from "../types/types";

const SECRET_KEY = config.get("secretKey");

const UserSchema = new mongoose.Schema<IUser>({
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
});

// generate an verification code for the user, valid for 5mins
UserSchema.methods.generateVerificationToken = function (code: string) {
  const user = this;

  return jwt.sign({ id: user._id, code }, SECRET_KEY as string, {
    expiresIn: "5m",
  });
};

// session tokens that are valid for 1h
// users are logged in for 1h, after that they have to login (for a new token)
UserSchema.methods.generateAuthToken = function () {
  const user = this;

  return jwt.sign({ id: user._id }, SECRET_KEY as string, { expiresIn: "1h" });
};

// compare the hashed password with the user input (password)
UserSchema.methods.comparePassword = async function (password: string) {
  const user = this;

  return bcrypt.compare(password, user.password);
};

// update the users verified status to true (default: false)
// also save the user ...
UserSchema.methods.verifyUser = async function () {
  const user = this;

  user.verified = true;

  return user.save();
};

export const User = mongoose.model("User", UserSchema);
