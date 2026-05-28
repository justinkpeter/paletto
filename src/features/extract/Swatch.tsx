import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./Swatch.module.scss";
import { DragIcon, LockClosedIcon, LockOpenIcon } from "@/components/ui/Icon";

type Props = {
  id?: string;
  hex: string;
  name: string;
  index: number;
  locked: boolean;
  isCopied: boolean;
  isLoading: boolean;
  isSkeleton: boolean;
  isDragging?: boolean;
  isOverlay?: boolean;
  onClick: () => void;
  onToggleLock: () => void;
};

export default function Swatch({
  id,
  hex,
  name,
  index,
  locked,
  isCopied,
  isLoading,
  isSkeleton,
  isDragging,
  isOverlay,
  onClick,
  onToggleLock,
}: Props) {
  const delay = { "--delay": `${index * 0.07}s` } as React.CSSProperties;
  const color = { "--swatch-color": hex } as React.CSSProperties;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id ?? "",
      disabled: !id || locked,
    });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isSkeleton) {
    return <div className={styles.skeleton} style={delay} />;
  }

  if (isLoading) {
    return (
      <div className={styles.loading} style={{ ...color, ...delay }}>
        <span className={styles.color} />
        <span className={styles.hexSkeleton} />
        <span className={styles.nameSkeleton} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...color, ...delay, ...sortableStyle }}
      className={[
        styles.swatch,
        isCopied ? styles.copied : "",
        locked ? styles.locked : "",
        isDragging ? styles.dragging : "",
        isOverlay ? styles.overlay : "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...attributes}
      {...listeners}
    >
      {/* Drag handle */}
      {!locked && (
        <div className={styles.handle} title="Drag to reorder">
          <DragIcon />
        </div>
      )}

      {/* Color block — click to copy */}
      <button
        className={styles.colorBtn}
        onClick={onClick}
        title={`Copy ${hex}`}
      >
        <span className={styles.color} />
      </button>

      <span className={styles.hex}>{hex}</span>
      <span className={styles.name}>{name}</span>

      {/* Lock button */}
      <button
        className={`${styles.lockBtn} ${locked ? styles.lockActive : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock();
        }}
        title={locked ? "Unlock color" : "Lock color"}
      >
        {locked ? <LockClosedIcon /> : <LockOpenIcon />}
      </button>
    </div>
  );
}
