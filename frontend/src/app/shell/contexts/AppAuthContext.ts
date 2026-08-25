import React from "react";
import type { AuthUser } from "@/app/data/network/models/AuthUser";

export type AppAuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  expireSession: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AppAuthContext = React.createContext<AppAuthContextValue | null>(null);
