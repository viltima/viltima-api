import express, { NextFunction, Request, Response } from "express";
import SwaggerParser from "@apidevtools/swagger-parser";
import * as OpenApiValidator from "express-openapi-validator";
import { connector } from "swagger-routes-express";
import { StatusCodes } from "http-status-codes";
import { login } from "./controllers/login";
import { signup } from "./controllers/signup";
import { getVerificationCode } from "./controllers/getVerificationCode";
import { verify } from "./controllers/verify";
import { changePassword } from "./controllers/changePassword";

import swaggerUI from "swagger-ui-express";
import cors from "cors";
import morgan from "morgan";

import RatelimitThrottler from "./utils/ratelimit";

const routes = {
  login,
  signup,
  verify,
  getVerificationCode,
  changePassword,
};

const makeApp = async () => {
  const apiDescription = await SwaggerParser.validate(
    "app/swagger/swagger.yml"
  );
  const connect = connector(routes, apiDescription, {
    middleware: {
      rateLimit: RatelimitThrottler
    }
  });
  const app = express();

  app.use(express.json());
  app.use(morgan("tiny"));
  app.use(cors());
  app.use(
    OpenApiValidator.middleware({
      apiSpec: "app/swagger/swagger.yml",
    })
  );

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message,
      errors: err.errors,
    });
  });

  // swagger ui
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(apiDescription));

  connect(app);

  return app;
};

export { makeApp };
