import type { InjectionToken } from "tsyringe";
import { container } from "./di";

export function useInjection<T>(token: InjectionToken<T>): T {
  return container.resolve(token);
}
