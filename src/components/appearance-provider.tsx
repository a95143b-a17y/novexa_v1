"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_NOVEXA_FONT, getNovexaFontStack, isNovexaFontId, readableTextColor } from "@/lib/appearance-options";

export type NovexaAppearance = {
  theme: "light" | "dark";
  accent: "violet" | "blue" | "mint" | "rose";
  background: "aurora" | "paper" | "midnight" | "forest" | "custom";
  backgroundColor?: string;
  customImage?: string;
  writer: boolean;
  motion: boolean;
  fontFamily: string;
};

const defaults: NovexaAppearance = {
  theme: "dark",
  accent: "violet",
  background: "aurora",
  backgroundColor: "#101a36",
  customImage: undefined,
  writer: true,
  motion: true,
  fontFamily: DEFAULT_NOVEXA_FONT
};

type AppearanceContextValue = {
  appearance: NovexaAppearance;
  saveAppearance: (value: NovexaAppearance) => Promise<boolean>;
  previewAppearance: (value: NovexaAppearance) => void;
  ready: boolean;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);
const storageKey = "novexa-appearance";
const validHex = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);

function applyAppearance(value: NovexaAppearance) {
  const root = document.documentElement;
  root.dataset.novexaTheme = value.theme;
  root.dataset.novexaPalette = value.accent;
  root.dataset.novexaBackground = value.background;
  root.dataset.novexaWriter = value.writer ? "on" : "off";
  root.dataset.novexaMotion = value.motion ? "on" : "off";
  root.dataset.novexaFont = isNovexaFontId(value.fontFamily) ? value.fontFamily : DEFAULT_NOVEXA_FONT;
  root.style.colorScheme = value.theme;
  root.style.setProperty("--novexa-user-font", getNovexaFontStack(value.fontFamily));
  root.style.setProperty("--novexa-user-foreground", validHex(value.backgroundColor) ? readableTextColor(value.backgroundColor) : "#F4F7FF");

  if (validHex(value.backgroundColor)) {
    root.style.setProperty("--novexa-user-background", value.backgroundColor);
    root.dataset.novexaCustomColor = "true";
  } else {
    root.style.removeProperty("--novexa-user-background");
    delete root.dataset.novexaCustomColor;
  }

  if (value.customImage?.startsWith("data:image/") && value.customImage.length < 1_700_000) {
    root.style.setProperty("--novexa-wallpaper", `url("${value.customImage}")`);
  } else {
    root.style.removeProperty("--novexa-wallpaper");
  }
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<NovexaAppearance>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let local = defaults;
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const customImage =
        typeof parsed.customImage === "string" &&
        parsed.customImage.startsWith("data:image/") &&
        parsed.customImage.length < 1_700_000
          ? parsed.customImage
          : undefined;
      local = {
        theme: parsed.theme === "light" ? "light" : "dark",
        accent: ["violet", "blue", "mint", "rose"].includes(parsed.accent) ? parsed.accent : "violet",
        background:
          customImage && parsed.background === "custom"
            ? "custom"
            : ["aurora", "paper", "midnight", "forest"].includes(parsed.background)
              ? parsed.background
              : "aurora",
        backgroundColor: validHex(parsed.backgroundColor) ? parsed.backgroundColor : defaults.backgroundColor,
        customImage,
        writer: typeof parsed.writer === "boolean" ? parsed.writer : true,
        motion: typeof parsed.motion === "boolean" ? parsed.motion : true,
        fontFamily: isNovexaFontId(parsed.fontFamily) ? parsed.fontFamily : DEFAULT_NOVEXA_FONT
      };
    } catch {}

    setAppearance(local);
    applyAppearance(local);

    fetch("/api/profile/appearance", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = await response.json();
        const saved = payload.appearance;
        if (!saved || !Object.keys(saved).length) return;
        const merged: NovexaAppearance = {
          ...local,
          ...saved,
          backgroundColor: validHex(saved.backgroundColor) ? saved.backgroundColor : local.backgroundColor,
          fontFamily: isNovexaFontId(saved.fontFamily) ? saved.fontFamily : local.fontFamily,
          background: local.customImage && local.background === "custom" ? "custom" : saved.background,
          customImage: local.customImage
        };
        setAppearance(merged);
        applyAppearance(merged);
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            ...JSON.parse(localStorage.getItem(storageKey) || "{}"),
            ...merged
          }));
        } catch {}
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const previewAppearance = useCallback((value: NovexaAppearance) => {
    applyAppearance(value);
  }, []);

  const saveAppearance = useCallback(async (value: NovexaAppearance) => {
    const normalized: NovexaAppearance = {
      ...value,
      fontFamily: isNovexaFontId(value.fontFamily) ? value.fontFamily : DEFAULT_NOVEXA_FONT
    };
    setAppearance(normalized);
    applyAppearance(normalized);
    try {
      const current = JSON.parse(localStorage.getItem(storageKey) || "{}");
      localStorage.setItem(storageKey, JSON.stringify({ ...current, ...normalized }));
    } catch {}

    try {
      const response = await fetch("/api/profile/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: {
            ...normalized,
            background: normalized.background === "custom" ? "aurora" : normalized.background,
            customImage: undefined
          }
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({ appearance, saveAppearance, previewAppearance, ready }),
    [appearance, saveAppearance, previewAppearance, ready]
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useNovexaAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useNovexaAppearance doit être utilisé dans AppearanceProvider.");
  return context;
}
