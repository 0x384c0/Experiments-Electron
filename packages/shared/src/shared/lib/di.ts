// required by tsyringe at runtime, regardless of whether real design:paramtypes
// metadata gets emitted (Vite/esbuild doesn't emit it -- see AGENTS.md).
import "reflect-metadata";
import { container, injectable, inject } from "tsyringe";

export { container, injectable, inject };
