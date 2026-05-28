"use client";

import { useState } from "react";
import styles from "./SharedPalette.module.scss";
import { CheckIcon, CopyIcon } from "@/components/ui/Icon";
import Link from "next/link";

type Props = {
  palette: {
    id: string;
    name: string;
    colors: { hex: string; name: string }[];
    image_url: string;
    created_at: string;
  };
};

export default function SharedPalette({ palette }: Props) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleCopyAll = () => {
    const hexList = palette.colors.map((c) => c.hex).join("\n");
    navigator.clipboard.writeText(hexList);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <img
            src={palette.image_url}
            alt={palette.name}
            className={styles.image}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>{palette.name}</h1>
              <p className={styles.date}>
                {new Date(palette.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              className={`${styles.copyAllBtn} ${copiedAll ? styles.copied : ""}`}
              onClick={handleCopyAll}
            >
              {copiedAll ? (
                <>
                  <CheckIcon />
                  Copied
                </>
              ) : (
                <>
                  <CopyIcon />
                  Copy all
                </>
              )}
            </button>
          </div>

          <div className={styles.swatches}>
            {palette.colors.map((c, i) => (
              <button
                key={i}
                className={`${styles.swatch} ${copiedHex === c.hex ? styles.swatchCopied : ""}`}
                style={{ "--swatch-color": c.hex } as React.CSSProperties}
                onClick={() => handleCopyHex(c.hex)}
                title={`Copy ${c.hex}`}
              >
                <span className={styles.swatchColor} />
                <span className={styles.swatchHex}>{c.hex}</span>
                {c.name && <span className={styles.swatchName}>{c.name}</span>}
              </button>
            ))}
          </div>

          <div className={styles.footer}>
            <Link href="/" className={styles.brand}>
              Made with <strong>Paletto</strong>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
