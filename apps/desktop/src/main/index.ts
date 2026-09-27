import { app, shell, BrowserWindow, session } from "electron";
import { join } from "node:path";
import log from "electron-log/main";

log.initialize();

// dev needs 'unsafe-eval'/'unsafe-inline' + ws: for Vite HMR, prod does not.
// connect-src/img-src: weatherapi.com (API + forecast icon CDN) -- add the
// same origin here and in apps/web/nginx.conf when a feature calls a new API.
const CSP = app.isPackaged
  ? "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.weatherapi.com; connect-src 'self' https://api.weatherapi.com"
  : "default-src 'self' 'unsafe-eval' 'unsafe-inline' ws: http://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.weatherapi.com; connect-src 'self' ws: http://localhost:* https://api.weatherapi.com";

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

app.whenReady().then(async () => {
  log.info("app ready");

  // build-time flag (not app.isPackaged): lets Rollup dead-code-eliminate this
  // whole branch, so the devDependency never ships in the packaged app at all.
  if (import.meta.env.DEV) {
    const devtools = await import("electron-devtools-installer");
    await devtools.default(devtools.REACT_DEVELOPER_TOOLS).catch((err: unknown) => {
      log.warn("failed to install React DevTools", err);
    });
  }

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
