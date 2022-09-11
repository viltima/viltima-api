import { Request, Response } from "express";
import { registration } from "../clients/handler";
import { StatusCodes } from "http-status-codes";
import * as Sentry from "@sentry/node";
import { ERROR_MSG } from "../utils/helpers";

export const signup = async (req: Request, res: Response) => {
  try {
    const response = await registration(req.body);

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
