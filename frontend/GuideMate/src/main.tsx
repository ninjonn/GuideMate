import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import AppProviders from "./app/providers/AppProviders";
import { setAuthToken } from "./lib/api";

const token = localStorage.getItem("gm_token");
if (token) {
  setAuthToken(token);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
