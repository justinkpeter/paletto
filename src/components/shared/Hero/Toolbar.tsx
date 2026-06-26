import { BemBuilder } from "@/lib/BemBuilder";
import { LockIcon, LockOpenIcon, SwatchBookIcon, XIcon } from "lucide-react";
import styles from "./Toolbar.module.scss";

export default function Toolbar({
  className,
  visible,
  onRemove,
  locked,
  onToggleLock,
  onExpand,
}: {
  className: string;
  visible: boolean;
  onRemove?: () => void;
  locked: boolean;
  onToggleLock?: () => void;
  onExpand?: () => void;
}) {
  const bem = new BemBuilder("toolbar", styles);
  return (
    <div className={`${bem.block(visible ? "visible" : "")} ${className}`}>
      <button
        className={bem.element("button")}
        title="Remove"
        onClick={onRemove}
      >
        <XIcon />
      </button>
      <button
        className={bem.element("button")}
        title={locked ? "Unlock" : "Lock"}
        onClick={onToggleLock}
      >
        {locked ? <LockIcon /> : <LockOpenIcon />}
      </button>
      <button
        className={bem.element("button")}
        title="Shades"
        onClick={onExpand}
      >
        <SwatchBookIcon />
      </button>
    </div>
  );
}
