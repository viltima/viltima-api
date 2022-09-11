/* eslint-disable no-magic-numbers */
import { Request, Response } from "express";
import jwtDecode from "jwt-decode";
import { StatusCodes } from "http-status-codes";
import * as Sentry from "@sentry/node";
import { authenticateMiddleware, ERROR_MSG } from "../utils/helpers";
import { verifyUser } from "../clients/handler";
import { JwtToken } from "../types/types";

export const verify = async (req: Request, res: Response) => {
  try {
    // take the code from the user input (body code)
    const token = authenticateMiddleware(req);
    const verificationCode = req.body.code;
    const { exp, id, code }: JwtToken = jwtDecode(token as string);

    // check if the code is valid
    if (Date.now() >= exp * 1000) {
      throw new Error("Verification has expired");
    }

    // check if the code is valid/matching with the one in the system
    if (verificationCode !== code) {
      throw new Error("Invalid verification code.");
    }

    // database query
    await verifyUser(id);

    res.status(StatusCodes.OK).json({
      ok: true,
      message: "Account verified!",
    });
  } catch (error: any) {
    Sentry.captureException(error);
    const message = error.message || ERROR_MSG;

    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({
      message,
    });
  }
};
