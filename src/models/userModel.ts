import db from "../config/db.ts";
import { User, PublicUser } from "../types/types.ts";

export const createUser = (
  username: string,
  email: string,
  hashedPassword: string
): Promise<PublicUser> => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, hashedPassword], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, username, email });
    });
  });
};

export const findUserByEmail = (email: string): Promise<User | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) reject(err);
      else resolve(row as User | undefined);
    });
  });
};
