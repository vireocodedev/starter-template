import { z } from "zod";

/** Application-wide lifecycle modes shared by entity form fields and form hooks. */
export const AppFormMode = z.enum(["CREATE", "UPDATE", "READ"]);

export type AppFormMode = z.infer<typeof AppFormMode>;
