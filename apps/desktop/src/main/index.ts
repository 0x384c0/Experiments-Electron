import { app, shell, BrowserWindow, session } from "electron";
import { join } from "node:path";
import log from "electron-log/main";

log.initialize();

// dev needs 'unsafe-eval'/'unsafe-inline' + ws: for Vite HMR, prod does not.
const CSP = app.isPackaged
  ? "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
  : "default-src 'self' 'unsafe-eval' 'unsafe-inline' ws: http://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data:";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  log.info("app ready");

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [CSP],
      },
    });
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
