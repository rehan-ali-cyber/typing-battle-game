import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <div style={{
        padding: "40px",
        color: "#f8fafc",
        fontFamily: "system-ui, sans-serif",
        background: "#0d101c",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#00f2fe", fontSize: "2rem", fontWeight: 800 }}>⚔️ DUEL ARENA</h2>
        <div style={{ margin: "24px 0", padding: "20px", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "8px", background: "rgba(255,255,255,0.02)", maxWidth: "480px" }}>
          <p style={{ fontSize: "1.1rem", margin: "0 0 12px 0", color: "#f8fafc" }}>Clerk Authentication Key is missing.</p>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            Please create a free account at <strong>clerk.com</strong>, create an application, and add your publishable key as <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your environment variables.
          </p>
        </div>
      </div>
    )}
  </React.StrictMode>
);
