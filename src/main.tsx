import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initSectionPresets } from "./components/overlay/sectionPresetRuntime";
import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/animations.css";
import "./styles/primitives.css";
import "./styles/patterns.css";
import "./styles/sections.css";
import "./styles/responsive.css";
import "./styles/overlay.css";

initSectionPresets();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
