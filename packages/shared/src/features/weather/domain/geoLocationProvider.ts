import { injectable } from "../../../shared/lib/di";
import type { LocationModel } from "./models";

// browser Geolocation API works the same in the Electron renderer and the
// web build, no per-shell implementation needed here (unlike PlatformInfo).
const GEOLOCATION_TIMEOUT_MS = 5000;

// positive 74.006 intentional: matches the source app's simulator/no-permission
// fallback coordinate as-is.
const FALLBACK_LOCATION: LocationModel = { latitude: 40.7128, longitude: 74.006 };

@injectable()
export class GeoLocationProvider {
  getLocation(): Promise<LocationModel> {
    if (!navigator.geolocation) {
      return Promise.resolve(FALLBACK_LOCATION);
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(FALLBACK_LOCATION),
        { timeout: GEOLOCATION_TIMEOUT_MS },
      );
    });
  }
}
