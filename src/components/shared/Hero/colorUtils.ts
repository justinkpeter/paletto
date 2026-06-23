import chroma from "chroma-js";
import { ColorScheme } from "./colorTypes";

export function getHarmonyHues(baseHue: number, type: ColorScheme): number[] {
  switch (type) {
    case "analogous":
      return [0, 12, 24, 36, 48].map((o) => baseHue + o);
    case "complementary":
      return [0, 8, 180, 188, 196].map((o) => baseHue + o);
    case "triadic":
      return [0, 8, 120, 128, 240].map((o) => baseHue + o);
    case "split-complementary":
      return [0, 8, 150, 210, 218].map((o) => baseHue + o);
    case "tetradic":
      return [0, 90, 180, 270, 278].map((o) => baseHue + o);
  }
}
export function generatePalette(): string[] {
  const baseHue = Math.random() * 360;
  const harmonies: ColorScheme[] = [
    "analogous",
    "complementary",
    "triadic",
    "split-complementary",
    "tetradic",
  ];
  const harmony = harmonies[Math.floor(Math.random() * harmonies.length)];
  const hues = getHarmonyHues(baseHue, harmony);

  return hues.map((hue) => {
    const saturation = 0.5 + Math.random() * 0.35;
    const lightness = 0.35 + Math.random() * 0.3;
    return chroma.hsl(hue % 360, saturation, lightness).hex();
  });
}
