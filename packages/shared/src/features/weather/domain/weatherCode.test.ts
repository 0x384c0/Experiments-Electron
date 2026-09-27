import { describe, expect, it } from "vitest";
import { mapWeatherCode } from "./weatherCode";

describe("mapWeatherCode", () => {
  it("maps a known WMO code", () => {
    expect(mapWeatherCode(0)).toEqual({ text: "Clear sky", icon: "☀️" });
  });

  it("falls back for an unknown code", () => {
    expect(mapWeatherCode(-1)).toEqual({ text: "Unknown", icon: "❓" });
  });
});
