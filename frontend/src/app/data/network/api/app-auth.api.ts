import type { AuthUser } from "../models/AuthUser";

export interface AppAuthApi {
  login(username: string, password: string): Promise<{ username: string; message: string }>;
  logout(): Promise<void>;
  me(): Promise<AuthUser>;
}
