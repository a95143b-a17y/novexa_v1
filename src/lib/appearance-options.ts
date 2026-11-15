export type NovexaFontOption = {
  id: string;
  label: string;
  category: "Calligraphique" | "Éditorial" | "Sans serif" | "Manuscrite" | "Monospace";
  stack: string;
};

export const NOVEXA_FONT_OPTIONS: NovexaFontOption[] = [
  { id: "segoe-script", label: "Segoe Script", category: "Calligraphique", stack: '"Segoe Script","Brush Script MT",cursive' },
  { id: "brush-script", label: "Brush Script MT", category: "Calligraphique", stack: '"Brush Script MT","Segoe Script",cursive' },
  { id: "lucida-handwriting", label: "Lucida Handwriting", category: "Calligraphique", stack: '"Lucida Handwriting","Apple Chancery",cursive' },
  { id: "apple-chancery", label: "Apple Chancery", category: "Calligraphique", stack: '"Apple Chancery","URW Chancery L",cursive' },
  { id: "snell-roundhand", label: "Snell Roundhand", category: "Calligraphique", stack: '"Snell Roundhand","Apple Chancery",cursive' },
  { id: "bradley-hand", label: "Bradley Hand", category: "Calligraphique", stack: '"Bradley Hand","Segoe Print",cursive' },
  { id: "monotype-corsiva", label: "Monotype Corsiva", category: "Calligraphique", stack: '"Monotype Corsiva","URW Chancery L",cursive' },
  { id: "mistral", label: "Mistral", category: "Calligraphique", stack: 'Mistral,"Brush Script MT",cursive' },
  { id: "freestyle-script", label: "Freestyle Script", category: "Calligraphique", stack: '"Freestyle Script","Segoe Script",cursive' },
  { id: "french-script", label: "French Script MT", category: "Calligraphique", stack: '"French Script MT","Apple Chancery",cursive' },
  { id: "edwardian-script", label: "Edwardian Script ITC", category: "Calligraphique", stack: '"Edwardian Script ITC","Snell Roundhand",cursive' },
  { id: "vivaldi", label: "Vivaldi", category: "Calligraphique", stack: 'Vivaldi,"URW Chancery L",cursive' },
  { id: "kunstler-script", label: "Kunstler Script", category: "Calligraphique", stack: '"Kunstler Script","Apple Chancery",cursive' },
  { id: "lucida-calligraphy", label: "Lucida Calligraphy", category: "Calligraphique", stack: '"Lucida Calligraphy","Lucida Handwriting",cursive' },
  { id: "bickley-script", label: "Bickley Script", category: "Calligraphique", stack: '"Bickley Script","Brush Script MT",cursive' },
  { id: "noteworthy", label: "Noteworthy", category: "Manuscrite", stack: 'Noteworthy,"Segoe Print",cursive' },
  { id: "marker-felt", label: "Marker Felt", category: "Manuscrite", stack: '"Marker Felt","Comic Sans MS",cursive' },
  { id: "chalkboard", label: "Chalkboard", category: "Manuscrite", stack: 'Chalkboard,"Comic Sans MS",cursive' },
  { id: "comic-sans", label: "Comic Sans MS", category: "Manuscrite", stack: '"Comic Sans MS","Comic Sans",cursive' },
  { id: "papyrus", label: "Papyrus", category: "Manuscrite", stack: 'Papyrus,fantasy' },
  { id: "georgia", label: "Georgia", category: "Éditorial", stack: 'Georgia,serif' },
  { id: "garamond", label: "Garamond", category: "Éditorial", stack: 'Garamond,"Times New Roman",serif' },
  { id: "palatino", label: "Palatino Linotype", category: "Éditorial", stack: '"Palatino Linotype","Book Antiqua",serif' },
  { id: "book-antiqua", label: "Book Antiqua", category: "Éditorial", stack: '"Book Antiqua",Palatino,serif' },
  { id: "baskerville", label: "Baskerville", category: "Éditorial", stack: 'Baskerville,"Times New Roman",serif' },
  { id: "didot", label: "Didot", category: "Éditorial", stack: 'Didot,"Bodoni MT",serif' },
  { id: "bodoni", label: "Bodoni MT", category: "Éditorial", stack: '"Bodoni MT",Didot,serif' },
  { id: "cambria", label: "Cambria", category: "Éditorial", stack: 'Cambria,Georgia,serif' },
  { id: "constantia", label: "Constantia", category: "Éditorial", stack: 'Constantia,Georgia,serif' },
  { id: "charter", label: "Charter", category: "Éditorial", stack: 'Charter,"Bitstream Charter",serif' },
  { id: "iowan-old-style", label: "Iowan Old Style", category: "Éditorial", stack: '"Iowan Old Style","Palatino Linotype",serif' },
  { id: "hoefler-text", label: "Hoefler Text", category: "Éditorial", stack: '"Hoefler Text",Baskerville,serif' },
  { id: "times-new-roman", label: "Times New Roman", category: "Éditorial", stack: '"Times New Roman",Times,serif' },
  { id: "avenir", label: "Avenir Next", category: "Sans serif", stack: '"Avenir Next",Avenir,Helvetica,sans-serif' },
  { id: "gill-sans", label: "Gill Sans", category: "Sans serif", stack: '"Gill Sans","Gill Sans MT",sans-serif' },
  { id: "futura", label: "Futura", category: "Sans serif", stack: 'Futura,"Century Gothic",sans-serif' },
  { id: "optima", label: "Optima", category: "Sans serif", stack: 'Optima,"Segoe UI",sans-serif' },
  { id: "trebuchet", label: "Trebuchet MS", category: "Sans serif", stack: '"Trebuchet MS",sans-serif' },
  { id: "verdana", label: "Verdana", category: "Sans serif", stack: 'Verdana,Geneva,sans-serif' },
  { id: "tahoma", label: "Tahoma", category: "Sans serif", stack: 'Tahoma,Geneva,sans-serif' },
  { id: "franklin-gothic", label: "Franklin Gothic Medium", category: "Sans serif", stack: '"Franklin Gothic Medium","Arial Narrow",sans-serif' },
  { id: "arial", label: "Arial", category: "Sans serif", stack: 'Arial,Helvetica,sans-serif' },
  { id: "helvetica-neue", label: "Helvetica Neue", category: "Sans serif", stack: '"Helvetica Neue",Helvetica,Arial,sans-serif' },
  { id: "segoe-ui", label: "Segoe UI", category: "Sans serif", stack: '"Segoe UI",system-ui,sans-serif' },
  { id: "calibri", label: "Calibri", category: "Sans serif", stack: 'Calibri,"Segoe UI",sans-serif' },
  { id: "century-gothic", label: "Century Gothic", category: "Sans serif", stack: '"Century Gothic",Futura,sans-serif' },
  { id: "impact", label: "Impact", category: "Sans serif", stack: 'Impact,"Arial Narrow",sans-serif' },
  { id: "consolas", label: "Consolas", category: "Monospace", stack: 'Consolas,"Courier New",monospace' },
  { id: "courier-new", label: "Courier New", category: "Monospace", stack: '"Courier New",Courier,monospace' },
  { id: "menlo", label: "Menlo", category: "Monospace", stack: 'Menlo,Monaco,monospace' },
];

export const NOVEXA_BACKGROUND_COLORS = [
  { id: "deep-space", label: "Espace profond", hex: "#080D1B" },
  { id: "midnight-blue", label: "Bleu minuit", hex: "#101A36" },
  { id: "indigo-night", label: "Nuit indigo", hex: "#17153B" },
  { id: "royal-navy", label: "Bleu royal", hex: "#172B4D" },
  { id: "ocean-deep", label: "Océan profond", hex: "#103447" },
  { id: "petrol", label: "Pétrole", hex: "#123C42" },
  { id: "forest-dark", label: "Forêt sombre", hex: "#18372F" },
  { id: "pine", label: "Pin", hex: "#214A3C" },
  { id: "emerald", label: "Émeraude", hex: "#145A4A" },
  { id: "sage", label: "Sauge", hex: "#647A69" },
  { id: "graphite", label: "Graphite", hex: "#252A35" },
  { id: "charcoal", label: "Charbon", hex: "#333943" },
  { id: "slate", label: "Ardoise", hex: "#48566A" },
  { id: "steel-blue", label: "Bleu acier", hex: "#46677F" },
  { id: "storm", label: "Orage", hex: "#596879" },
  { id: "lavender-night", label: "Lavande nuit", hex: "#30264B" },
  { id: "plum", label: "Prune", hex: "#4B294F" },
  { id: "aubergine", label: "Aubergine", hex: "#49243E" },
  { id: "burgundy", label: "Bordeaux", hex: "#592B3A" },
  { id: "wine", label: "Vin", hex: "#6A3045" },
  { id: "terracotta", label: "Terre cuite", hex: "#824B3B" },
  { id: "copper", label: "Cuivre", hex: "#985D42" },
  { id: "cocoa", label: "Cacao", hex: "#513B32" },
  { id: "coffee", label: "Café", hex: "#49372E" },
  { id: "sand-dark", label: "Sable foncé", hex: "#75634C" },
  { id: "cloud", label: "Nuage", hex: "#E8EDF2" },
  { id: "ice", label: "Glace", hex: "#DDECF1" },
  { id: "mist-blue", label: "Brume bleue", hex: "#D7E4EF" },
  { id: "pale-blue", label: "Bleu pâle", hex: "#C5DDF0" },
  { id: "sky", label: "Ciel", hex: "#A9D5EA" },
  { id: "mint-light", label: "Menthe claire", hex: "#C7E6DA" },
  { id: "pistachio", label: "Pistache", hex: "#D6E5C6" },
  { id: "sage-light", label: "Sauge claire", hex: "#DCE4D6" },
  { id: "ivory", label: "Ivoire", hex: "#F1EBDD" },
  { id: "parchment", label: "Parchemin", hex: "#E8DCC5" },
  { id: "linen", label: "Lin", hex: "#E6DCCF" },
  { id: "warm-grey", label: "Gris chaud", hex: "#D8D1C8" },
  { id: "silver", label: "Argent", hex: "#CED3D8" },
  { id: "rose-powder", label: "Rose poudré", hex: "#EBCFD8" },
  { id: "blush", label: "Blush", hex: "#F0D6D0" },
  { id: "peach", label: "Pêche", hex: "#F2D2B7" },
  { id: "apricot", label: "Abricot", hex: "#EFC39D" },
  { id: "amber-soft", label: "Ambre doux", hex: "#E9C77E" },
  { id: "lemon-cream", label: "Crème citron", hex: "#F1E9B8" },
  { id: "lilac", label: "Lilas", hex: "#DDD2EF" },
  { id: "lavender", label: "Lavande", hex: "#CFC4E8" },
  { id: "periwinkle", label: "Pervenche", hex: "#C5C9EA" },
  { id: "mauve", label: "Mauve", hex: "#C8AEC8" },
  { id: "coral-soft", label: "Corail doux", hex: "#E9A99A" },
  { id: "salmon", label: "Saumon", hex: "#E9B5A6" }
] as const;

export const DEFAULT_NOVEXA_FONT = "georgia";

export function isNovexaFontId(value: unknown): value is string {
  return typeof value === "string" && NOVEXA_FONT_OPTIONS.some((font) => font.id === value);
}

export function getNovexaFontStack(value: unknown): string {
  return NOVEXA_FONT_OPTIONS.find((font) => font.id === value)?.stack ?? 'Georgia,"Times New Roman",serif';
}

export function readableTextColor(hex: string): string {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return luminance > 0.42 ? "#18202B" : "#F4F7FF";
}
