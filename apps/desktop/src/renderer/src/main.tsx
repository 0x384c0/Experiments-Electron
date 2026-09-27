import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { App, theme, store } from "@experiments-electron/shared";

// HashRouter, not Browser: the packaged app is loaded via file://, which has
// no server to resolve a browser-history path on refresh/reload.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HashRouter>
          <App />
        </HashRouter>
      </ThemeProvider>
    </ReduxProvider>
  </React.StrictMode>,
);
