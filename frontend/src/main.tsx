import "@fontsource-variable/inter";
import "./main.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import { installMockAppAdapters } from "@/app/adapters/mock/app.mock-adapters";
import { appConfig } from "@/app/config/app-config";

if (appConfig.apiMode === "mock") installMockAppAdapters();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
