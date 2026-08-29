import React from "react";
import type { AuthUser } from "@/app/data/network/models/AuthUser";
import type { AppAuthFailure } from "@/app/data/network/models/AppAuthFailure";

export type AppAuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  failure?: AppAuthFailure | null;
  expireSession: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AppAuthContext = React.createContext<AppAuthContextValue | null>(null);
