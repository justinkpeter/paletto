import { generateShades } from "@/components/shared/Hero/colorUtils";
import { XIcon } from "lucide-react";
import chroma from "chroma-js";
import styles from "./ShadesBlock.module.scss";
import { BemBuilder } from "@/lib/BemBuilder";

export default function ShadesBlock({
  color,
  onCollapse,
}: {
  color: string;
  onCollapse: () => void;
}) {
  const bem = new BemBuilder("shadesBlock", styles);
  const shades = generateShades(color);

  return (
    <div className={bem.block()}>
      <button className={bem.element("close")} onClick={onCollapse}>
        <XIcon size={16} />
      </button>
      <div className={bem.element("swatches")}>
        {shades.reverse().map((shade, i) => {
          const textColor = chroma(shade).luminance() > 0.4 ? "#000" : "#fff";
          return (
            <div
              key={i}
              className={styles.shadesBlock__swatch}
              style={{ background: shade }}
            >
              <span
                className={styles.shadesBlock__hex}
                style={{ color: textColor }}
              >
                {shade.replace("#", "").toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
