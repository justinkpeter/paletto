"use client";

import { useState, useEffect } from "react";
import { supabase, savePalette } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import styles from "./ExportBar.module.scss";
import type { ColorEntry } from "./useExtract";
import {
  CheckIcon,
  CopyIcon,
  SpinnerIcon,
  SaveIcon,
} from "@/components/ui/Icon";

type Props = {
  colors: ColorEntry[];
  visible: boolean;
  preview: string | null;
};

export default function ExportBar({ colors, visible, preview }: Props) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedHexList, setSavedHexList] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const hexList = colors.map((c) => c.hex).join("\n");
  const saved = savedHexList === hexList && savedHexList !== null;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(hexList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!user || !preview) return;
    setSaving(true);
    try {
      await savePalette({
        name: "Untitled Palette",
        colors: colors.map((c) => ({ hex: c.hex, name: c.name })),
        imageDataUrl: preview,
        userId: user.id,
      });
      setSavedHexList(hexList);
      setTimeout(() => setSavedHexList(null), 3000);
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${styles.bar} ${visible ? styles.visible : ""}`}>
      <div className={styles.inner}>
        <div className={styles.preview}>
          {colors.map((c) => (
            <span
              key={c.id}
              className={styles.dot}
              style={{ "--dot-color": c.hex } as React.CSSProperties}
            />
          ))}
        </div>

        <div className={styles.divider} />

        <span className={styles.label}>Hex</span>

        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
          onClick={handleCopy}
        >
          {copied ? (
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

        {user && (
          <>
            <div className={styles.divider} />
            <button
              className={`${styles.saveBtn} ${saved ? styles.saved : ""}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saved ? (
                <>
                  <CheckIcon />
                  Saved
                </>
              ) : saving ? (
                <>
                  <SpinnerIcon />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Save
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
