"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { useEffect, useRef } from "react";
import styles from "./SortableBlock.module.scss";
import { BemBuilder } from "@/lib/BemBuilder";

type Props = {
  id: string;
  index: number;
  mounted?: boolean;
  removing?: boolean;
  onMount?: () => void;
  children: React.ReactNode;
};

export default function SortableBlock({
  id,
  index,
  mounted,
  removing,
  onMount,
  children,
}: Props) {
  const { ref } = useSortable({ id, index });
  const bem = new BemBuilder("sortableBlock", styles);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      onMount?.();
    }
  }, []);

  return (
    <div ref={ref} className={bem.block()} data-mounted={mounted && !removing}>
      {children}
    </div>
  );
}
