import chroma from "chroma-js";
import styles from "./ColorBlock.module.scss";
import Toolbar from "../Toolbar/Toolbar";
import { BemBuilder } from "@/lib/BemBuilder";
import { LockIcon } from "lucide-react";

export default function ColorBlock({
  color,
  visionFilter,
  onRemove,
  locked,
  onToggleLock,
  onExpand,
}: {
  color: string;
  visionFilter?: string;
  onRemove?: () => void;
  locked: boolean;
  onToggleLock?: () => void;
  onExpand?: () => void;
}) {
  const bem = new BemBuilder("colorBlock", styles);
  const textColor = chroma(color).luminance() > 0.5 ? "#000000" : "#FFFFFF";

  return (
    <div
      className={bem.block()}
      style={{ backgroundColor: color, color: textColor, filter: visionFilter }}
    >
      <Toolbar
        className={bem.element("toolbar")}
        onRemove={onRemove}
        locked={locked}
        onToggleLock={onToggleLock}
        onExpand={onExpand}
        color={color}
      />
      <div className={bem.element("bottom")}>
        <div className={bem.element("lock")} data-locked={locked}>
          <LockIcon size={16} />
        </div>
        <div>{color.split("#").pop()?.toUpperCase()}</div>
      </div>
    </div>
  );
}
