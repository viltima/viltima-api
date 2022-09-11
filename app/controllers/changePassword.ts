import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as Sentry from "@sentry/node";
import { authenticateMiddleware, ERROR_MSG } from "../utils/helpers";
import jwtDecode from "jwt-decode";
import { JwtToken } from "../types/types";
import { resetPassword } from "../clients/handler";

export const changePassword = async (req: Request, res: Response) => {
  try {
    // once the user enters his email, we will send
    // him a verification code, that proves the ownership
    const token = authenticateMiddleware(req);
    const verificationCode = req.body.code;
    const { exp, id, code }: JwtToken = jwtDecode(token as string);

    // check if the time is more or equals the expire time (5mins)
    if (Date.now() >= exp * 1000) {
      throw new Error("Verification has expired");
    }

    // if the code does not match with the one beint sent to the user
    // return an error ...
    if (verificationCode !== code) {
      throw new Error("Invalid verification code.");
    }

    // database query
    const response = await resetPassword(id, req.body.password);

    res.status(StatusCodes.OK).json({
      ok: true,
      ...response,
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
