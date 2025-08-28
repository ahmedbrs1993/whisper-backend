import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/httpStatus.ts";
import { Error } from "../types/errors.ts";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = err as Error;
  const message = error.message || "Unknown error occurred";
  const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  res.status(status).json({ success: false, message });
};
