const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*";

export function generateStrongPassword(length = 14): string {
  const all = LOWER + UPPER + DIGITS + SYMBOLS;
  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  const rest = Array.from({ length: length - required.length }, () => pick(all));
  const combined = [...required, ...rest];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
}

export function passwordHints(password: string): string[] {
  const hints: string[] = [];
  if (password.length < 8) hints.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) hints.push("One uppercase letter");
  if (!/[a-z]/.test(password)) hints.push("One lowercase letter");
  if (!/\d/.test(password)) hints.push("One number");
  return hints;
}
