"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./PalettesGrid.module.scss";
import {
  EmptyIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
} from "@/components/ui/Icon";
import Link from "next/link";

type SavedPalette = {
  id: string;
  name: string;
  colors: { hex: string; name: string }[];
  image_url: string;
  created_at: string;
};

type Props = {
  palettes: SavedPalette[];
};

function PaletteCard({
  palette,
  onDelete,
}: {
  palette: SavedPalette;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(palette.name);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(palette.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setEditing(false);
      setDraft(name);
      return;
    }
    setName(trimmed);
    setEditing(false);
    await supabase
      .from("palettes")
      .update({ name: trimmed })
      .eq("id", palette.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setEditing(false);
      setDraft(name);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={palette.image_url} alt={name} className={styles.image} />
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(palette.id)}
          title="Delete palette"
        >
          <TrashIcon />
        </button>
      </div>

      <div className={styles.strip}>
        {palette.colors.map((c, i) => (
          <span
            key={i}
            className={styles.stripColor}
            style={{ "--strip-color": c.hex } as React.CSSProperties}
            title={`${c.name} — ${c.hex}`}
          />
        ))}
      </div>

      <div className={styles.meta}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.nameInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            maxLength={50}
            autoFocus
          />
        ) : (
          <button
            className={styles.nameBtn}
            onClick={startEdit}
            title="Click to rename"
          >
            {name}
            <PencilIcon />
          </button>
        )}
        <div className={styles.metaRight}>
          <Link
            href={`/palette/${palette.id}`}
            className={styles.shareBtn}
            target="_blank"
            rel="noopener noreferrer"
            title="View shareable page"
          >
            <ShareIcon />
          </Link>
          <span className={styles.date}>
            {new Date(palette.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PalettesGrid({ palettes: initial }: Props) {
  const [palettes, setPalettes] = useState(initial);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await supabase.from("palettes").delete().eq("id", id);
    setPalettes((prev) => prev.filter((p) => p.id !== id));
  };

  if (palettes.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyInner}>
          <EmptyIcon />
          <h2>No palettes yet</h2>
          <p>Extract a palette from an image and hit Save to see it here.</p>
          <button className={styles.goBack} onClick={() => router.push("/")}>
            Extract a palette
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Your palettes</h1>
        <span className={styles.count}>{palettes.length} saved</span>
      </div>

      <div className={styles.grid}>
        {palettes.map((palette) => (
          <PaletteCard
            key={palette.id}
            palette={palette}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
