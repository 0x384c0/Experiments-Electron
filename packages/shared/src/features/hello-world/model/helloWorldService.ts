import { injectable, inject, type PlatformInfo, PlatformInfoToken } from "../../../shared/lib/di";

// depends on the PlatformInfo abstraction, not on window.api / a platform check --
// each shell registers its own concrete PlatformInfo before rendering <App />.
@injectable()
export class HelloWorldService {
  constructor(@inject(PlatformInfoToken) private readonly platformInfo: PlatformInfo) {}

  getPlatformLabel(): string {
    return this.platformInfo.platform;
  }
}
