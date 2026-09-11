import { z } from "zod";

export const shareBrainSchema = z.object({
  share: z.boolean(),
});