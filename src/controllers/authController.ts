import bcrypt from "bcrypt";
import { Response, NextFunction } from "express";
import { createUser, findUserByEmail } from "../models/userModel.ts";
import { HTTP_STATUS } from "../constants/httpStatus.ts";
import { MESSAGES } from "../constants/messages.ts";
import { signToken } from "../utils/jwt.ts";
import { validatePassword } from "../utils/validation.ts";
import {
  TypedRequest,
  SignupRequestBody,
  SigninRequestBody,
  User,
  PublicUser,
} from "../types/types.ts";

/**
 * Signup new user
 */
export const signup = async (
  req: TypedRequest<SignupRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.AUTH.REQUIRED_FIELDS });
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.AUTH.WEAK_PASSWORD,
        errors: passwordErrors,
      });
    }

    const existingUser: User | undefined = await findUserByEmail(email);
    if (existingUser) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.AUTH.EMAIL_IN_USE });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: PublicUser = await createUser(
      username,
      email,
      hashedPassword
    );

    const token = signToken({ id: newUser.id });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      token,
      user: { id: newUser.id, username, email },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Signin existing user
 */
export const signin = async (
  req: TypedRequest<SigninRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.AUTH.EMAIL_PASSWORD_REQUIRED,
      });
      return;
    }

    const user: User | undefined = await findUserByEmail(email);
    if (!user) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    const token = signToken({ id: user.id });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Signout user
 */
export const signout = (_req: TypedRequest<{}>, res: Response) => {
  res
    .status(HTTP_STATUS.OK)
    .json({ success: true, message: MESSAGES.AUTH.LOGGED_OUT });
};
