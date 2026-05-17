import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  client: {
    PUBLIC_POSTHOG_HOST: z.url().optional(),
    PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    PUBLIC_R2_PUBLIC_URL: z.url(),
  },
  clientPrefix: "PUBLIC_",
  emptyStringAsUndefined: true,
  runtimeEnv: typeof window === "undefined" ? process.env : import.meta.env,
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    DATABASE_URL: z.url(),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
  },
});
