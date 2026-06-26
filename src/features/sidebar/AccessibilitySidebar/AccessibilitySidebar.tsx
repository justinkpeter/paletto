"use client";

import { useMemo } from "react";
import { Eye } from "lucide-react";
import { BemBuilder } from "@/lib/BemBuilder";
import { usePaletteStore } from "@/store/paletteStore";
import { SidebarPanel, useSidebar } from "@/features/sidebar/SidebarContext";
import styles from "./AccessibilitySidebar.module.scss";
import Sidebar from "@/components/shared/Sidebar/Sidebar";
import OptionGroup from "@/components/ui/input/OptionGroup";
import { SelectOption } from "@/components/shared/Hero/colorUtils";

// ---- Types ----------------------------------------------------------------

type VisionMode =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

type ContrastLevel = "AA" | "AAA" | "fail";

interface ContrastResult {
  originalHex: string; // for display
  simulatedHex: string; // for background + contrast math
  ratio: number;
  level: ContrastLevel;
}

interface AdjacentResult {
  hexA: string;
  hexB: string;
  ratio: number;
  pass: boolean;
  warn: boolean;
}

// ---- Constants ------------------------------------------------------------

const VISION_OPTIONS: SelectOption<VisionMode>[] = [
  { value: "normal", label: "Normal Vision", description: "Full color vision" },
  { value: "protanopia", label: "Protanopia", description: "Red-blind" },
  { value: "deuteranopia", label: "Deuteranopia", description: "Green-blind" },
  { value: "tritanopia", label: "Tritanopia", description: "Blue-blind" },
  { value: "achromatopsia", label: "Achromatopsia", description: "Monochrome" },
];

// ---- Color math -----------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "fail";
}

// Vision simulation matrices (applied in linearized sRGB)
const VISION_MATRICES: Record<VisionMode, number[]> = {
  normal: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  achromatopsia: [
    0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114,
  ],
};

function simulateVision(hex: string, mode: VisionMode): string {
  if (mode === "normal") return hex;
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const m = VISION_MATRICES[mode];
  const toSRGB = (v: number) =>
    Math.round(
      (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255,
    );
  return rgbToHex(
    toSRGB(m[0] * r + m[1] * g + m[2] * b),
    toSRGB(m[3] * r + m[4] * g + m[5] * b),
    toSRGB(m[6] * r + m[7] * g + m[8] * b),
  );
}

function textContrastResults(
  colors: string[],
  visionMode: VisionMode,
): ContrastResult[] {
  return colors.map((hex) => {
    const simulated = simulateVision(hex, visionMode);
    const onWhite = contrastRatio(simulated, "#ffffff");
    const onBlack = contrastRatio(simulated, "#000000");
    const best = Math.max(onWhite, onBlack);
    return {
      originalHex: hex,
      simulatedHex: simulated,
      ratio: best,
      level: contrastLevel(best),
    };
  });
}

function adjacentContrastResults(
  colors: string[],
  visionMode: VisionMode,
): AdjacentResult[] {
  const results: AdjacentResult[] = [];
  for (let i = 0; i < colors.length - 1; i++) {
    const a = simulateVision(colors[i], visionMode);
    const b = simulateVision(colors[i + 1], visionMode);
    const ratio = contrastRatio(a, b);
    results.push({
      hexA: a,
      hexB: b,
      ratio,
      pass: ratio >= 3,
      warn: ratio >= 1.5 && ratio < 3,
    });
  }
  return results;
}

// ---- Sub-components -------------------------------------------------------

function ContrastBadge({
  level,
  textColor,
}: {
  level: ContrastLevel;
  textColor: string;
}) {
  return (
    <span
      className={styles["contrast-badge"]}
      data-level={level}
      aria-label={`WCAG ${level}`}
      style={{
        color: textColor,
        borderColor: textColor,
        border: `1px solid ${textColor}`,
        borderRadius: "8px",
        fontSize: "10px",
        padding: "3px 8px",
      }}
    >
      {level === "fail" ? "fail" : level}
    </span>
  );
}

function AdjacentBadge({ pass, warn }: { pass: boolean; warn: boolean }) {
  if (pass) return null;
  return (
    <span
      className={styles["adjacent-badge"]}
      data-warn={warn}
      aria-label={warn ? "Low contrast warning" : "Contrast fail"}
    >
      {warn ? "⚠" : "✕"}
    </span>
  );
}

function HalfCircle({ hexA, hexB }: { hexA: string; hexB: string }) {
  return (
    <span className={styles["half-circle"]} aria-hidden="true">
      <span style={{ background: hexA }} />
      <span style={{ background: hexB }} />
    </span>
  );
}

// ---- Main component -------------------------------------------------------

export default function AccessibilitySidebar() {
  const bem = useMemo(() => new BemBuilder("accessibility", styles), []);
  const { isOpen, toggle } = useSidebar();

  const blocks = usePaletteStore((s) => s.blocks);
  const colors = useMemo(() => blocks.map((b) => b.color), [blocks]);
  const visionMode = usePaletteStore((s) => s.visionMode ?? "normal");
  const setVisionMode = usePaletteStore((s) => s.setVisionMode);

  const textResults = useMemo(
    () => textContrastResults(colors, visionMode),
    [colors, visionMode],
  );

  const adjacentResults = useMemo(
    () => adjacentContrastResults(colors, visionMode),
    [colors, visionMode],
  );

  return (
    <Sidebar
      isOpen={isOpen(SidebarPanel.ACCESSIBILITY)}
      onClose={() => toggle(SidebarPanel.ACCESSIBILITY)}
      title="Accessibility"
      icon={<Eye size={16} />}
    >
      {/* Vision simulation */}
      <div className={bem.element("section")}>
        <OptionGroup
          label="VISION SIMULATION"
          variant="list"
          options={VISION_OPTIONS}
          value={visionMode}
          onChange={setVisionMode}
        />
      </div>

      {/* Text contrast */}
      <div className={bem.element("section")}>
        <p className={bem.element("section-label")}>TEXT CONTRAST</p>
        <div className={bem.element("contrast-grid")}>
          {textResults.map(({ originalHex, simulatedHex, ratio, level }, i) => {
            const textColor =
              relativeLuminance(simulatedHex) > 0.35 ? "#111" : "#fff";
            return (
              <div
                key={i}
                className={bem.element("contrast-card")}
                style={{ background: simulatedHex }} // simulated color as bg
              >
                <div className={bem.element("contrast-card-top")}>
                  <span
                    className={bem.element("aa-sample")}
                    style={{ color: textColor }}
                  >
                    Aa
                  </span>
                  <ContrastBadge level={level} textColor={textColor} />
                </div>
                <span
                  className={bem.element("contrast-hex")}
                  style={{ color: textColor }}
                >
                  {originalHex} {/* always show original hex */}
                </span>
                <span
                  className={bem.element("contrast-ratio")}
                  style={{ color: textColor }}
                >
                  {ratio.toFixed(1)}:1
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adjacent contrast */}
      <div className={bem.element("section")}>
        <p className={bem.element("section-label")}>ADJACENT CONTRAST</p>
        <div className={bem.element("adjacent-list")}>
          {adjacentResults.map(({ hexA, hexB, ratio, pass, warn }, i) => (
            <div key={i} className={bem.element("adjacent-row")}>
              <HalfCircle hexA={hexA.split("#")[0]} hexB={hexB} />
              <span className={bem.element("adjacent-ratio")}>
                {ratio.toFixed(1)}:1
              </span>
              <AdjacentBadge pass={pass} warn={warn} />
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
}
