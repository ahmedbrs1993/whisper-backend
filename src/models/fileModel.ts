import db from "../config/db.ts";
import { File, FileTableView } from "../types/types.ts";

// Insert uploaded file metadata
export const createFile = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO files (user_id, file_name, description, language, path, transcription)
                   VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(
      query,
      [
        file.user_id,
        file.file_name,
        file.description,
        file.language,
        file.path,
        file.transcription,
      ],
      function (err) {
        if (err) reject(err);
        else resolve({ ...file, id: this.lastID });
      }
    );
  });
};

// Get file by ID
export const getFileById = (id: number): Promise<File | undefined> => {
  return new Promise((resolve, reject) => {
    db.get<File>(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row || undefined);
    });
  });
};

// Update transcription
export const updateTranscription = (
  id: number,
  transcription: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE files SET transcription = ? WHERE id = ?`,
      [transcription, id],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

// Get all files by user
export const getFilesByUser = (
  user_id: number,
  page = 1,
  limit = 10
): Promise<FileTableView[]> => {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, file_name, description, language, created_at
      FROM files
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    db.all(query, [user_id, limit, offset], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as FileTableView[]);
    });
  });
};

// Delete file
export const deleteFile = (id: number, user_id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM files WHERE id = ? AND user_id = ?`,
      [id, user_id],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};
