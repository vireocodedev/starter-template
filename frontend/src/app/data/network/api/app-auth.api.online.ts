import { AppAxiosHttpClient } from "../clients/AppAxiosClient";
import type { AppAuthApi } from "./app-auth.api";
import { AuthUser } from "../models/AuthUser";
import { z } from "zod";

const AuthLoginResponseSchema = z.object({ username: z.string(), message: z.string() });

export class AppAuthApiOnline extends AppAxiosHttpClient implements AppAuthApi {
  constructor() {
    super("auth");
  }

  async login(username: string, password: string) {
    return this.httpPost(AuthLoginResponseSchema)("login", { username, password });
  }

  async logout(): Promise<void> {
    await this.httpPost(z.unknown())("logout");
  }

  async me() {
    return this.httpGet(AuthUser)("me", { timeout: 8_000 });
  }
}

export const appAuthApi = new AppAuthApiOnline();
