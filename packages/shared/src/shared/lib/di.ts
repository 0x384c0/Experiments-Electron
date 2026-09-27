// required by tsyringe at runtime, regardless of whether real design:paramtypes
// metadata gets emitted (Vite/esbuild doesn't emit it -- see AGENTS.md).
import "reflect-metadata";
import { container, injectable, inject, type InjectionToken } from "tsyringe";

export interface PlatformInfo {
  platform: string;
}

// each shell's main.tsx registers its own implementation before rendering <App />
export const PlatformInfoToken: InjectionToken<PlatformInfo> = "PlatformInfo";

export { container, injectable, inject };
