import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import AuthProvider from "./context/AuthProvider.tsx";
import DeployProvider from "./context/DeployProvider.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <DeployProvider>
        <App />
      </DeployProvider>
    </AuthProvider>
  </StrictMode>
);
