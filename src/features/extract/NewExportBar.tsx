"use client";

import { useEffect } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { usePaletteStore } from "@/store/paletteStore";

const EXPORT_TOAST_ID = "export-bar";

export default function ExportBar() {
  const blocks = usePaletteStore((s) => s.blocks);

  useEffect(() => {
    if (blocks.length === 0) return;

    const handleCopy = () => {
      const hex = usePaletteStore
        .getState()
        .blocks.map((b) => b.color)
        .join(", ");
      navigator.clipboard.writeText(hex);
      toast.success("Copied to clipboard", {
        duration: 2000,
        dismissible: true,
      });
    };

    toast(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {blocks.map((b) => (
          <span
            key={b.id}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: b.color,
              flexShrink: 0,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
              transition: "background 0.3s ease, transform 0.3s ease",
            }}
          />
        ))}
      </div>,
      {
        id: EXPORT_TOAST_ID,
        duration: Infinity,
        dismissible: true,
        actionButtonStyle: {
          height: "fit-content",
        },
        action: {
          label: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px",
              }}
            >
              <Copy size={13} />
              Copy
            </span>
          ) as unknown as string,
          onClick: handleCopy,
        },
      },
    );
  }, [blocks]);

  return null;
}
