import { User } from "../model/user";
import { StatusCodes } from "http-status-codes";
import { Payload } from "../types/types";
import { sendEmail, validateEmail } from "../utils/helpers";

// import { PrivateLogger, PublicLogger } from "../log/data";

import bcrypt from "bcrypt";
import crypto from "crypto";

export const resendToken = async (payload: Payload) => {
  if (!validateEmail(payload.email as string)) {
    throw new Error("Provided email is invalid.");
  }

  // find the user in the database and check if he exists
  const user = await User.findOne({ email: payload.email }).exec();

  if (!user) throw new Error("User does not exists");

  // small function to generate a random number
  const verificationCode = crypto.randomInt(0, 1000000);
  // assign the random number to the users account/token
  const verificationToken = user.generateVerificationToken(verificationCode);

  await sendEmail({
    to: payload.email as string,
    subject: "Verify Account",
    html: `
    Dear user,

    <p>Please enter the following verification code to verify your account.</p>

    Verification code: ${verificationCode}
    `,
  });
  return {
    result: {
      verified: user.verified,
      token: verificationToken,
      message: `We have sent a verification email to ${payload.email}`,
      username: user.username,
    },
    status: StatusCodes.OK,
  };
};

export const registration = async (payload: Payload) => {
  if (!validateEmail(payload.email as string)) {
    throw new Error("Provided email is invalid.");
  }

  // find the user in the database and check if he exists
  let user = await User.findOne({ email: payload.email }).exec();

  if (user) throw new Error("User already exists!");

  // Insert the new user into the database if they do not exist yet
  user = new User({
    username: payload.username,
    email: payload.email,
    password: payload.password,
  });

  // generate a 10 digit salt for the password
  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const verificationCode = crypto.randomInt(0, 1000000);
  // assign the random number to the users account/token
  const verificationToken = user.generateVerificationToken(verificationCode);

  await sendEmail({
    to: payload.email as string,
    subject: "Viltima Registration",
    html: `
    Thanks for signing up a new account ${payload.username}!

    <p>Please use the following code to verify your account.</p>
    Verification code: ${verificationCode}
    `,
  });

  // discord logging
  // await PrivateLogger();
  // await PublicLogger();

  return {
    result: {
      verified: false,
      token: verificationToken,
      message: `We have sent a verification email to ${payload.email}`,
      username: user.username,
    },
    status: StatusCodes.OK,
  };
};

export const login = async (payload: Payload) => {
  // password + username + email is our Payload (interface'd)
  // we either allow logins with email + password or username + password
  const query = payload.email
    ? { email: payload.email }
    : { username: payload.username };

  if (query.email && !validateEmail(query.email))
    throw new Error("Provided email is invalid.");

  // find the user in the database ...
  const user = await User.findOne(query).exec();

  // some security squizzels
  if (!user) throw new Error("Incorrect email or password.");
  if (!user.verified) throw new Error("Email is not verified!");

  const validPassword = await user.comparePassword(payload.password);

  if (!validPassword) throw new Error("Incorrect email or password.");

  const authToken = user.generateAuthToken();

  return {
    result: {
      verified: true,
      id: user._id.toString(),
      token: authToken,
      username: user.username,
    },
    status: StatusCodes.OK,
  };
};

export const verifyUser = async (id: string) => {
  const user = await User.findOne({ _id: id }).exec();

  if (!user) throw new Error("User does not exists");
  await user.verifyUser();
};

export const resetPassword = async (id: string, password: string) => {
  // find the user in the database, return an error
  // if the user does not exist
  const user = await User.findOne({ _id: id }).exec();
  if (!user) throw new Error("User does not  exists");

  // generate a new 10 digit salt for the password
  const salt = await bcrypt.genSalt(10);

  // hash the new password and save the user
  user.password = await bcrypt.hash(password, salt);

  return user.save();
};
