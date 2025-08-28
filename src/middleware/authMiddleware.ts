import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/httpStatus.ts";
import { MESSAGES } from "../constants/messages.ts";
import { TypedRequest } from "../types/types.ts";
import { ENV } from "../config/env.ts";

export const authMiddleware = (
  req: TypedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.TOKEN.MISSING,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET as string) as {
      id: number;
    };

    req.user = { id: decoded.id };
    next();
  } catch {
    next({
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: MESSAGES.TOKEN.INVALID,
    });
  }
};
