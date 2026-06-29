import { BemBuilder } from "@/lib/BemBuilder";
import {
  LockIcon,
  LockOpenIcon,
  SwatchBookIcon,
  XIcon,
  CopyIcon,
} from "lucide-react";
import styles from "./Toolbar.module.scss";
import { toast } from "sonner";

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export default function Toolbar({
  className,
  onRemove,
  locked,
  onToggleLock,
  onExpand,
  color,
}: {
  className: string;
  onRemove?: () => void;
  locked: boolean;
  onToggleLock?: () => void;
  onExpand?: () => void;
  color?: string;
}) {
  const bem = new BemBuilder("toolbar", styles);
  const tone = color && relativeLuminance(color) > 0.35 ? "light" : "dark";

  return (
    <div className={`${bem.block()} ${className}`} data-tone={tone}>
      <button
        className={bem.element("button")}
        title="Copy"
        onClick={() => {
          if (color) {
            navigator.clipboard.writeText(color);
            toast.success("Color copied to clipboard", {
              duration: 2000,
              dismissible: true,
            });
          }
        }}
      >
        <CopyIcon size={18} />
      </button>
      <button
        className={bem.element("button")}
        title="Remove"
        onClick={onRemove}
      >
        <XIcon size={18} />
      </button>
      <button
        className={bem.element("button")}
        title={locked ? "Unlock" : "Lock"}
        onClick={onToggleLock}
      >
        {locked ? <LockIcon size={18} /> : <LockOpenIcon size={18} />}
      </button>
      <button
        className={bem.element("button")}
        title="Shades"
        onClick={onExpand}
      >
        <SwatchBookIcon size={18} />
      </button>
    </div>
  );
}
