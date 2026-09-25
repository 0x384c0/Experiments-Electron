export interface Api {
  platform: NodeJS.Platform;
}

declare global {
  interface Window {
    api: Api;
  }
}
