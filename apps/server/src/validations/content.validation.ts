import * as z from "zod";

const richTextSchema = z.record(z.string(), z.any());

export const ContentSchema = z.object({
  type: z.enum([
    "note",
    "youtube",
    "tweet",
    "instagram",
    "facebook",
    "github",
    "reddit",
    "amazon",
    "flipkart",
    "googleDrive",
    "linkedin",
    "medium",
    "wikipedia",
    "openai",
    "claude",
    "gemini",
    "link",
  ]),

  link: z
    .string()
    .trim()
    .optional(),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),

  body: richTextSchema.optional(),

  tags: z
    .array(z.string().trim().min(1))
    .max(10, "Maximum 10 tags allowed"),
});