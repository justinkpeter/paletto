import { CheckIcon } from "@/components/ui/Icon";
import styles from "./Toast.module.scss";

type Props = {
  /** Message to show. When null/empty, nothing renders. */
  message: string | null | undefined;
  /** Leading icon. Defaults to a check; pass `null` to hide it. */
  icon?: React.ReactNode;
};

export default function Toast({ message, icon = <CheckIcon /> }: Props) {
  if (!message) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      {icon}
      {message}
    </div>
  );
}
