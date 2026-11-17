"use client";

import styles from "./appearance-studio.module.css";
import {
  NOVEXA_BACKGROUND_COLORS,
  NOVEXA_BACKGROUND_GRADIENTS,
  NOVEXA_FONT_OPTIONS,
  getNovexaFontStack,
  readableTextColor,
  getNovexaGradient
} from "@/lib/appearance-options";
import type { NovexaAppearance } from "@/components/appearance-provider";

type Props = {
  value: NovexaAppearance;
  onChange: (value: NovexaAppearance) => void;
  sections?: "typography" | "background" | "all";
};

export default function AppearanceStudio({ value, onChange, sections = "all" }: Props) {
  const showTypography = sections === "typography" || sections === "all";
  const showBackground = sections === "background" || sections === "all";
  const selectedFont = NOVEXA_FONT_OPTIONS.find((font) => font.id === value.fontFamily) ?? NOVEXA_FONT_OPTIONS[20];
  const selectedColor = value.backgroundColor || "#101A36";
  const selectedGradient = getNovexaGradient(value.backgroundGradient);
  const previewText = readableTextColor(selectedGradient?.colors[0] || selectedColor);

  function selectFont(fontId: string) {
    onChange({ ...value, fontFamily: fontId });
  }

  function selectColor(hex: string) {
    onChange({ ...value, theme: readableTextColor(hex) === "#18202B" ? "light" : "dark", background: "aurora", backgroundColor: hex, backgroundGradient: undefined, customImage: undefined });
  }

  function selectGradient(id: string) {
    const gradient = NOVEXA_BACKGROUND_GRADIENTS.find((item) => item.id === id);
    if (!gradient) return;
    onChange({ ...value, theme: readableTextColor(gradient.colors[0]) === "#18202B" ? "light" : "dark", background: "aurora", backgroundColor: gradient.colors[0], backgroundGradient: id, customImage: undefined });
  }

  return (
    <section className={styles.studio} aria-label="Personnalisation visuelle NOVEXA">
      <div className={styles.studioHeading}>
        <div>
          <span className={styles.eyebrow}>ATELIER VISUEL NOVEXA</span>
          <h2>Crée ton univers visuel</h2>
          <p>Chaque sélection actualise l’aperçu immédiatement. Tu peux encore tout modifier avant d’enregistrer.</p>
        </div>
        <span className={styles.livePill}><i /> Aperçu en direct</span>
      </div>

      <div className={styles.preview} style={{ background: selectedGradient?.css ?? selectedColor, color: previewText }}>
        <div className={styles.previewTop}>
          <span className={styles.previewBrand}>NOVEXA</span>
          <span className={styles.previewState}>APERÇU EN DIRECT</span>
        </div>
        <div className={styles.previewBody}>
          <span className={styles.previewKicker}>TON ESPACE PERSONNALISÉ</span>
          <h3 style={{ fontFamily: selectedFont.stack }}>Apprendre avec méthode.</h3>
          <p style={{ color: previewText, opacity: 0.82 }}>La typographie et la couleur de fond se mettent à jour dès que tu sélectionnes une option.</p>
          <div className={styles.previewActions}>
            <span style={{ background: "var(--nx-accent, #9278e6)" }}>Continuer</span>
            <small>Exemple de ton interface</small>
          </div>
        </div>
      </div>

      {showTypography && (
        <div className={styles.choiceSection}>
          <div className={styles.sectionHeading}>
            <div><span>01 · TYPOGRAPHIE</span><h3>50 polices d’écriture</h3></div>
            <small>{selectedFont.label} sélectionnée</small>
          </div>
          <p className={styles.helper}>50 familles web distinctes : calligraphiques, manuscrites, éditoriales, sans serif, monospace et technologiques.</p>
          <div className={styles.fontGrid}>
            {NOVEXA_FONT_OPTIONS.map((font, index) => (
              <button
                type="button"
                key={font.id}
                className={font.id === value.fontFamily ? styles.fontSelected : styles.fontChoice}
                aria-pressed={font.id === value.fontFamily}
                onClick={() => selectFont(font.id)}
                title={font.label}
              >
                <span style={{ fontFamily: font.stack }}>Aa</span>
                <b>{String(index + 1).padStart(2, "0")}. {font.label}</b>
                <small>{font.category}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {showBackground && (
        <div className={styles.choiceSection}>
          <div className={styles.sectionHeading}>
            <div><span>02 · ARRIÈRE-PLAN</span><h3>50 couleurs de fond</h3></div>
            <small>{NOVEXA_BACKGROUND_COLORS.find((color) => color.hex.toLowerCase() === selectedColor.toLowerCase())?.label ?? selectedColor.toUpperCase()}</small>
          </div>
          <p className={styles.helper}>Sélectionne une teinte pour voir immédiatement le rendu dans l’aperçu. Le sélecteur libre et les images importées restent disponibles.</p>
          <div className={styles.colorGrid}>
            {NOVEXA_BACKGROUND_COLORS.map((color, index) => (
              <button
                key={color.id}
                type="button"
                className={color.hex.toLowerCase() === selectedColor.toLowerCase() ? styles.colorSelected : styles.colorChoice}
                style={{ backgroundColor: color.hex }}
                aria-label={`${index + 1}. ${color.label}`}
                aria-pressed={color.hex.toLowerCase() === selectedColor.toLowerCase()}
                title={`${color.label} · ${color.hex}`}
                onClick={() => selectColor(color.hex)}
              ><span>{color.hex.toUpperCase()}</span></button>
            ))}
          </div>
          <div className={styles.gradientSection}>
            <div className={styles.sectionHeading}><div><span>03 · DÉGRADÉS</span><h3>20 dégradés de couleurs</h3></div><small>{selectedGradient?.label ?? "Aucun dégradé sélectionné"}</small></div>
            <div className={styles.gradientGrid}>{NOVEXA_BACKGROUND_GRADIENTS.map((gradient) => (
              <button key={gradient.id} type="button" className={gradient.id === value.backgroundGradient ? styles.gradientSelected : styles.gradientChoice} style={{ background: gradient.css }} aria-label={gradient.label} aria-pressed={gradient.id === value.backgroundGradient} title={gradient.label} onClick={() => selectGradient(gradient.id)}><span>{gradient.label}</span></button>
            ))}</div>
          </div>
        </div>
      )}
    </section>
  );
}
