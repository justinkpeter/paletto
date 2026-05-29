"use client";

import { useRouter } from "next/navigation";

import styles from "./BackButton.module.scss";
import { ChevronLeftIcon } from "@/components/ui/Icon";

type Props = {
  /** Where to go when there's no in-app history (direct load / shared link). */
  fallback?: string;
  label?: string;
  /** Page-specific alignment (margin, align-self, etc.). */
  className?: string;
};

export default function BackButton({
  fallback = "/",
  label = "Back",
  className,
}: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className ? `${styles.backBtn} ${className}` : styles.backBtn}
    >
      <ChevronLeftIcon />
      {label}
    </button>
  );
}
