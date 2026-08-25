import React from "react";
import { AppAuthContext } from "../contexts/AppAuthContext";

export function useAppAuth() {
  const value = React.useContext(AppAuthContext);
  if (!value) throw new Error("useAppAuth must be used inside AppAuthProvider.");
  return value;
}
