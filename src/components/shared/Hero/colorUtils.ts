import chroma from "chroma-js";

export type ColorScheme =
  | "analogous"
  | "complementary"
  | "triadic"
  | "split-complementary"
  | "monochromatic"
  | "tetradic";

export type Mood =
  | "any"
  | "vibrant"
  | "bright"
  | "pastel"
  | "soft"
  | "muted"
  | "moody"
  | "dark"
  | "warm"
  | "cool"
  | "earthy"
  | "playful"
  | "elegant"
  | "retro"
  | "neon";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export const SCHEME_OPTIONS: SelectOption<ColorScheme | "auto">[] = [
  { value: "auto", label: "Auto", description: "Random harmony" },
  {
    value: "monochromatic",
    label: "Monochromatic",
    description: "Single hue variations",
  },
  { value: "analogous", label: "Analogous", description: "Adjacent hues" },
  {
    value: "complementary",
    label: "Complementary",
    description: "Opposite hues",
  },
  {
    value: "split-complementary",
    label: "Split Comp.",
    description: "Opposite + adjacent",
  },
  { value: "triadic", label: "Triadic", description: "Three-way split" },
  { value: "tetradic", label: "Tetradic", description: "Four-way rectangle" },
];

export const MOOD_OPTIONS: SelectOption<Mood>[] = (
  [
    "any",
    "vibrant",
    "bright",
    "pastel",
    "soft",
    "muted",
    "moody",
    "dark",
    "warm",
    "cool",
    "earthy",
    "playful",
    "elegant",
    "retro",
    "neon",
  ] as Mood[]
).map((m) => ({
  value: m,
  label: m.charAt(0).toUpperCase() + m.slice(1),
}));

// -- Internal types --

type MoodProfile = {
  saturation: [number, number];
  lightness: [number, number];
  hueShift?: number;
};

const MOOD_PROFILES: Record<Mood, MoodProfile> = {
  any: { saturation: [0.4, 0.85], lightness: [0.25, 0.65] },
  vibrant: { saturation: [0.75, 0.95], lightness: [0.45, 0.6] },
  bright: { saturation: [0.7, 0.9], lightness: [0.55, 0.72] },
  pastel: { saturation: [0.25, 0.5], lightness: [0.7, 0.88] },
  soft: { saturation: [0.2, 0.45], lightness: [0.6, 0.8] },
  muted: { saturation: [0.1, 0.3], lightness: [0.4, 0.65] },
  moody: { saturation: [0.3, 0.6], lightness: [0.15, 0.35] },
  dark: { saturation: [0.4, 0.7], lightness: [0.1, 0.28] },
  warm: { saturation: [0.5, 0.85], lightness: [0.35, 0.6], hueShift: 20 },
  cool: { saturation: [0.4, 0.75], lightness: [0.35, 0.6], hueShift: -20 },
  earthy: { saturation: [0.25, 0.55], lightness: [0.28, 0.52] },
  playful: { saturation: [0.65, 0.9], lightness: [0.5, 0.7] },
  elegant: { saturation: [0.15, 0.4], lightness: [0.2, 0.5] },
  retro: { saturation: [0.35, 0.65], lightness: [0.45, 0.65] },
  neon: { saturation: [0.9, 1.0], lightness: [0.5, 0.65] },
};

const MOOD_HUE_RANGES: Partial<Record<Mood, [number, number]>> = {
  warm: [0, 60],
  cool: [180, 270],
  earthy: [20, 50],
  neon: [0, 360],
};

// -- Helpers --

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

// -- Core --

/**
 * Returns `count` hues arranged according to the given harmony scheme.
 * Each scheme defines a base set of offsets; if count exceeds the base
 * set, extra hues are filled by cycling through the base offsets with a
 * small random jitter so they don't overlap exactly.
 */
export function getHarmonyHues(
  baseHue: number,
  scheme: ColorScheme,
  count: number,
): number[] {
  const h = baseHue % 360;

  const BASE_OFFSETS: Record<ColorScheme, number[]> = {
    monochromatic: [0, 0, 0, 0, 0, 0, 0, 0],
    analogous: [0, 18, -18, 36, -36, 54, -54, 72],
    complementary: [0, 10, -10, 180, 170, 190, 5, 175],
    "split-complementary": [0, 10, 150, 210, -10, 145, 215, 20],
    triadic: [0, 120, 240, 8, 128, 248, -8, 112],
    tetradic: [0, 90, 180, 270, 45, 135, 225, 315],
  };

  const offsets = BASE_OFFSETS[scheme];

  return Array.from({ length: count }, (_, i) => {
    const offset =
      i < offsets.length
        ? offsets[i]
        : offsets[i % offsets.length] + (Math.random() * 10 - 5);
    return (h + offset + 360) % 360;
  });
}

function generateForScheme(
  hues: number[],
  scheme: ColorScheme,
  mood: Mood,
): string[] {
  const profile = MOOD_PROFILES[mood];
  const count = hues.length;

  if (scheme === "monochromatic") {
    const sat = lerp(profile.saturation[0], profile.saturation[1], 0.5);
    const [lMin, lMax] = profile.lightness;
    return Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const l = lerp(lMax, lMin, t);
      return chroma.hsl(hues[0] % 360, sat, l).hex();
    });
  }

  return hues.map((hue, i) => {
    const hueShift = profile.hueShift ?? 0;
    const h = (hue + hueShift + 360) % 360;
    const s = lerp(profile.saturation[0], profile.saturation[1], Math.random());
    const l = lerp(profile.lightness[0], profile.lightness[1], Math.random());
    const isAccent = scheme === "complementary" && i >= 3;
    const finalS = isAccent ? Math.min(s * 1.15, 1) : s;
    return chroma.hsl(h, finalS, l).hex();
  });
}

/**
 * Generates a palette of `count` colors using the given scheme and mood.
 *
 * @param baseHue - Optional hue (0–360) to use as the anchor instead of
 *   picking one randomly. Pass this when generating from an extracted image
 *   so the palette stays rooted to the image's dominant color.
 */
export function generatePalette(
  scheme: string,
  mood: string,
  autoScheme: boolean,
  count: number = 5,
  baseHue?: number,
): string[] {
  const schemes: ColorScheme[] = [
    "analogous",
    "complementary",
    "triadic",
    "split-complementary",
    "monochromatic",
    "tetradic",
  ];

  const resolvedScheme = autoScheme
    ? schemes[Math.floor(Math.random() * schemes.length)]
    : (scheme as ColorScheme);

  // Use provided baseHue (from extracted image) or pick randomly within mood range
  const hueRange = MOOD_HUE_RANGES[mood as Mood] ?? [0, 360];
  const resolvedBaseHue =
    baseHue !== undefined
      ? baseHue
      : lerp(hueRange[0], hueRange[1], Math.random());

  const hues = getHarmonyHues(resolvedBaseHue, resolvedScheme, count);
  return generateForScheme(hues, resolvedScheme, mood as Mood);
}

export type VisionMode =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

export const VISION_OPTIONS = [
  { value: "normal", label: "Normal Vision", description: "Full color vision" },
  { value: "protanopia", label: "Protanopia", description: "Red-blind" },
  { value: "deuteranopia", label: "Deuteranopia", description: "Green-blind" },
  { value: "tritanopia", label: "Tritanopia", description: "Blue-blind" },
  { value: "achromatopsia", label: "Achromatopsia", description: "Monochrome" },
];

export const VISION_FILTERS: Record<string, string> = {
  normal: "none",
  protanopia: "url(#protanopia)",
  deuteranopia: "url(#deuteranopia)",
  tritanopia: "url(#tritanopia)",
  achromatopsia: "url(#achromatopsia)",
};

export const generateShades = (hex: string, count = 20): string[] => {
  const [h, s] = hexToHsl(hex);
  return Array.from({ length: count }, (_, i) => {
    const l = (5 + (i / (count - 1)) * 90) / 100;
    return hslToHex(h, s, l);
  });
};

function hexToHsl(hex: string): [number, number] {
  console.log("hexToHsl input:", hex);
  const [h, s, l] = chroma(hex).hsl();
  console.log("hsl result:", h, s, l);
  return [h ?? 0, s ?? 0];
}

function hslToHex(h: number, s: number, l: number): string {
  return chroma.hsl(h, s, l).hex();
}

/**
 * Derives a representative base hue from an array of hex colors extracted
 * from an image. Uses the most saturated color as the anchor since it
 * tends to be the most visually dominant.
 */
export function baseHueFromExtracted(hexColors: string[]): number {
  if (!hexColors.length) return Math.random() * 360;

  let bestHue = 0;
  let bestSat = -1;

  for (const hex of hexColors) {
    try {
      const [h, s] = chroma(hex).hsl();
      if (s > bestSat) {
        bestSat = s;
        bestHue = h ?? 0;
      }
    } catch {
      // skip invalid colors
    }
  }

  return bestHue;
}
