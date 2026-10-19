import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("ANTI-GAME failed to find a root. Typical.");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
