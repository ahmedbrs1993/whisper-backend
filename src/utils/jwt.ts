import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env.ts";

type StringValue = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

/**
 * Sign a JWT token safely with TS
 */
export const signToken = (payload: object) => {
  const secret = ENV.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  const expiresIn: StringValue = (ENV.JWT_EXPIRES_IN as StringValue) || "1d";

  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
};
