import { Request } from "express";

// ------------------------
// Auth / Requests
// ------------------------
export interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
}

export interface SigninRequestBody {
  email: string;
  password: string;
}

// ------------------------
// Generic Request
// ------------------------
export interface TypedRequest<T = any> extends Request {
  body: T;
  user?: { id: number };
}

// ------------------------
// User Types
// ------------------------
export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  created_at?: string;
}

export interface PublicUser {
  id?: number;
  username: string;
  email: string;
  created_at?: string;
}

// ------------------------
// File Types
// ------------------------
export interface File {
  id?: number;
  user_id: number;
  file_name: string;
  description?: string;
  language?: string;
  path: string;
  transcription?: string;
  created_at?: string;
}

export type FileTableView = Pick<
  File,
  "id" | "file_name" | "description" | "language" | "created_at"
>;