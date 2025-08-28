export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 12) errors.push("Password must be at least 12 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (!/\d/.test(password)) errors.push("Password must contain at least one number");
  if (!/[\W_]/.test(password)) errors.push("Password must contain at least one special character");

  return errors;
}