import type { ValidatedSchemaFactory } from "@/app/ui/localization/validated-schema";
import { z } from "zod";

export const AuthUser = z.object({
  username: z.string(),
  role: z.enum(["USER", "SUPERADMIN"]).nullable(),
});

export type AuthUser = z.infer<typeof AuthUser>;

export function getDefaultAuthUser(): AuthUser {
  return { role: null, username: "" };
}

export const buildValidatedAuthUserSchema: ValidatedSchemaFactory<AuthUser> = () => AuthUser;
