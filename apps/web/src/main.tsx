import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { App, theme, store, container, PlatformInfoToken } from "@experiments-electron/shared";

container.registerInstance(PlatformInfoToken, { platform: "web" });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ReduxProvider>
  </React.StrictMode>,
);
