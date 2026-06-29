import { useRef, useState } from "react";

export function useRemoveBlock(
  removeBlock: (id: string) => void,
  duration = 350,
) {
  const [mountedIds, setMountedIds] = useState<Set<string>>(new Set());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const initMounted = (ids: string[]) => setMountedIds(new Set(ids));

  const handleMount = (id: string) => {
    requestAnimationFrame(() => setMountedIds((prev) => new Set(prev).add(id)));
  };

  const handleRemove = (id: string) => {
    if (removingIds.has(id)) return;
    setMountedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setRemovingIds((prev) => new Set(prev).add(id));

    const timer = setTimeout(() => {
      removeBlock(id);
      setRemovingIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      timers.current.delete(id);
    }, duration);

    timers.current.set(id, timer);
  };

  return { mountedIds, removingIds, initMounted, handleMount, handleRemove };
}
