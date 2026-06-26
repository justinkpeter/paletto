import { BemBuilder } from "@/lib/BemBuilder";
import { LockIcon, LockOpenIcon, SwatchBookIcon, XIcon } from "lucide-react";
import styles from "./Toolbar.module.scss";

export default function Toolbar({
  className,
  onRemove,
  locked,
  onToggleLock,
  onExpand,
}: {
  className: string;
  onRemove?: () => void;
  locked: boolean;
  onToggleLock?: () => void;
  onExpand?: () => void;
}) {
  const bem = new BemBuilder("toolbar", styles);
  return (
    <div className={`${bem.block()} ${className}`}>
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
