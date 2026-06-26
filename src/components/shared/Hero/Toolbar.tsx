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

  return (
    <div className={`${bem.block()} ${className}`}>
      <button
        className={bem.element("button")}
        title="Copy"
        onClick={() => {
          if (color) {
            navigator.clipboard.writeText(color);
            toast.success("Color has been copied to clipboard");
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
