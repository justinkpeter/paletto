import { PlusIcon } from "lucide-react";
import styles from "./AddBlockDivider.module.scss";

type Props = {
  onClick: () => void;
};

export default function AddBlockDivider({ onClick }: Props) {
  return (
    <div
      className={styles.divider}
      onClick={onClick}
      role="button"
      aria-label="Add color block"
    >
      <div className={styles.divider__line} />
      <button className={styles.divider__btn} tabIndex={0}>
        <PlusIcon size={20} strokeWidth={2} />
      </button>
      <div className={styles.divider__line} />
    </div>
  );
}
