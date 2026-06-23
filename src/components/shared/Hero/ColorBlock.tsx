import { useSortable } from "@dnd-kit/react/sortable";
import styles from "./ColorBlock.module.scss";

export default function ColorBlock({
  id,
  index,
  color,
}: {
  id: string;
  index: number;
  color: string;
}) {
  const { ref } = useSortable({ id, index });

  return (
    <div
      className={styles.colorBlock}
      ref={ref}
      style={{ backgroundColor: color }}
    >
      {color.split("#").pop()?.toUpperCase()}
    </div>
  );
}
