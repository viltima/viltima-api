import { Request } from "express";
import { Document } from "mongoose";

export interface Payload {
  password: string;
  username?: string;
  email?: string;
}

export interface JwtToken {
  exp: number;
  id: string;
  iat: number;
  code: number;
}

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  verified: boolean;
  sid: string;
  generateVerificationToken: (code: number) => string;
  comparePassword: (password: string) => Promise<boolean>;
  verifyUser: () => Promise<void>;
  generateAuthToken: () => string;
}

export interface IRequest extends Request {
  user: any;
}

export interface Doc {
  name: string;
  address: string;
  number: string;
  email: string;
  job: string;
  fitter: string;
  jobNumber: string;
  signature: string;
  date: string;
}

export interface Attachment {
  filename: string;
  path: string;
  contentType: string;
}

export interface Email {
  to: string;
  subject: string;
  html?: string;
  attachments?: Array<Attachment>;
}
