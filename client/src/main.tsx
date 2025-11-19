import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "@/components/theme-provider";

import App from "./App.tsx";
import AuthProvider from "./context/AuthProvider.tsx";
import DeployProvider from "./context/DeployProvider.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DeployProvider>
          <App />
        </DeployProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
