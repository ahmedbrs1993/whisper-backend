import fs from "fs";
import path from "path";

import { Response, NextFunction } from "express";
import { spawn } from "child_process";
import { HTTP_STATUS } from "../constants/httpStatus.ts";
import { Error } from "../types/errors.ts";
import { MESSAGES } from "../constants/messages.ts";
import { TypedRequest, File } from "../types/types.ts";
import {
  createFile,
  getFileById,
  getFilesByUser,
  deleteFile,
} from "../models/fileModel.ts";

/**
 * Helper: Run Python Whisper as Promise
 */
const runWhisper = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", ["transcribe.py", filePath]);
    let transcript = "";

    python.stdout.on("data", (data) => (transcript += data.toString()));
    python.on("error", () =>
      reject({
        message: MESSAGES.FILE.FAILED_TRANSCRIPTION,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      } as Error)
    );
    python.on("close", (code) => {
      if (code !== 0) {
        reject({
          message: `Transcription failed with code ${code}`,
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        } as Error);
      } else {
        resolve(transcript.trim());
      }
    });
  });
};

/**
 * Upload MP3 temporarily and transcribe immediately
 */
export const uploadAndTranscribe = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.AUTH.UNAUTHORIZED });
    }

    if (!req.file) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.FILE.NO_FILE });
    }
    if (req.file.mimetype !== "audio/mpeg") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.FILE.ONLY_MP3 });
    }

    const tempPath = req.file.path;
    const transcription = await runWhisper(tempPath);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      tempFile: tempPath,
      transcription,
      message: MESSAGES.FILE.TRANSCRIBED,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Save file metadata + transcription permanently
 */
export const saveFileData = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.AUTH.UNAUTHORIZED });
    }

    const {
      tempFile,
      file_name,
      description = "",
      language = "",
      transcription,
    }: {
      tempFile: string;
      file_name: string;
      description?: string;
      language?: string;
      transcription: string;
    } = req.body;

    if (!tempFile || !file_name || !transcription) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.FILE.MISSING_FIELDS });
    }

    const permanentDir = path.join("uploads", String(user_id));
    await fs.promises.mkdir(permanentDir, { recursive: true });
    const fileName = path.basename(tempFile);
    const permanentPath = path.join(permanentDir, fileName);
    await fs.promises.rename(tempFile, permanentPath);

    const newFile: File = await createFile({
      user_id,
      file_name,
      description,
      language,
      path: permanentPath,
      transcription,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.FILE.SAVED,
      file: newFile,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List all files for a user
 */
export const listUserFiles = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.AUTH.UNAUTHORIZED });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const files = await getFilesByUser(user_id, page, limit);

    res.status(HTTP_STATUS.OK).json({ success: true, files, page, limit });
  } catch (err) {
    next(err);
  }
};

/**
 * Get details of a file by ID
 */
export const getFileDetails = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileId = Number(req.params.id);
    const file = await getFileById(fileId);

    if (!file) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGES.FILE.NOT_FOUND });
    }

    res.status(HTTP_STATUS.OK).json({ success: true, file });
  } catch (err) {
    next(err);
  }
};

export const deleteUserFile = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.AUTH.UNAUTHORIZED });
    }

    const file = await getFileById(Number(id));

    if (!file || file.user_id !== userId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGES.FILE.NOT_FOUND });
    }

    await deleteFile(Number(id), userId);

    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.FILE.DELETED,
    });
  } catch (err) {
    next(err);
  }
};
