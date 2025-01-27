import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import BadRequestError from "./BadRequestError";

declare module "express" {
  export interface Request {
    user?: any;
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token)
    throw new BadRequestError({
      code: 401,
      message: "Access denied, No token provided.",
    });

  const isExpired = jwt.verify(token, process.env.SECRET_KEY as string);

  if (isExpired instanceof Error)
    throw new BadRequestError({
      code: 500,
      message: "Token expired or invalid",
    });

  const user = jwt.decode(token);

  req.user = user;

  next();
};
