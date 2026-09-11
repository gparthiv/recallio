import { z } from "zod";

const username = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters");

const signupPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(20, "Password must be at most 20 characters")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must include at least one special character"
  );

const signinPassword = z.string();

export const signupSchema = z.object({
  username,
  password: signupPassword,
});

export const signinSchema = z.object({
  username,
  password: signinPassword,
});