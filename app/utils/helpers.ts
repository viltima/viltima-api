import { Request } from "express";
import { Email } from "../types/types";

import mongoose from "mongoose";
import nodemailer from "nodemailer";

import Logger from "./logger";
const logger = new Logger();

import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  },
});

// connect to mongodb
export const connectDB = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_TOKEN as string;

    if (!MONGODB_URL) throw new Error("🛑 MONGODB_URL missing in .env.");
    await mongoose.connect(MONGODB_URL);

    logger.success("Database successfully connected");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export const ERROR_MSG =
  "Looks like the server took too long to respond. Please try again later";
export const CONN_ERROR =
  "There was an error connecting to the server. Please try again later";

// just a check - that checks if the users email is an "email"
export const validateEmail = (email: string) => {
  const regexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  return regexp.test(email);
};

export const sendEmail = async (email: Email) => {
  return transporter.sendMail(email);
};

export const authenticateMiddleware = (req: Request) => {
  const { authorization } = req.headers;
  return authorization && authorization.split(" ")[1];
};
