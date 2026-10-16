import { FullTheme, LiveEffectId, TranslationOption } from '../types/bible';

export const BIBLE_BOOKS: Record<'Old Testament' | 'New Testament', Record<string, number>> = {
  "Old Testament": {
    "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
    "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
    "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
    "Ezra": 10, "Nehemiah": 13, "Tobit": 14, "Judith": 16, "Esther": 16,
    "1 Maccabees": 16, "2 Maccabees": 15, "Job": 42, "Psalms": 150, "Proverbs": 31,
    "Ecclesiastes": 12, "Song of Solomon": 8, "Wisdom": 19, "Sirach": 51,
    "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Baruch": 6, "Ezekiel": 48,
    "Daniel": 14, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4,
    "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2,
    "Zechariah": 14, "Malachi": 4
  },
  "New Testament": {
    "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28,
    "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
    "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5,
    "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3,
    "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3,
    "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
  }
};

export const FLAT_BIBLE: { book: string; chapter: string }[] = [];
Object.keys(BIBLE_BOOKS).forEach(testament => {
  const tKey = testament as 'Old Testament' | 'New Testament';
  Object.keys(BIBLE_BOOKS[tKey]).forEach(book => {
    for (let i = 1; i <= BIBLE_BOOKS[tKey][book]; i++) {
      FLAT_BIBLE.push({ book, chapter: i.toString() });
    }
  });
});

export const BOOK_ALIASES: Record<string, string> = {
  "gen": "Genesis", "ge": "Genesis", "ex": "Exodus", "exod": "Exodus", "lev": "Leviticus", "lv": "Leviticus",
  "num": "Numbers", "nm": "Numbers", "deut": "Deuteronomy", "dt": "Deuteronomy", "josh": "Joshua", "jos": "Joshua",
  "judg": "Judges", "jdg": "Judges", "jg": "Judges", "ru": "Ruth", "1 sam": "1 Samuel", "1 sm": "1 Samuel", "2 sam": "2 Samuel", "2 sm": "2 Samuel",
  "1 kgs": "1 Kings", "1 ki": "1 Kings", "2 kgs": "2 Kings", "2 ki": "2 Kings", "1 chron": "1 Chronicles", "1 chr": "1 Chronicles", "2 chron": "2 Chronicles", "2 chr": "2 Chronicles",
  "ezr": "Ezra", "neh": "Nehemiah", "tob": "Tobit", "jdt": "Judith", "est": "Esther", "esth": "Esther", "1 mac": "1 Maccabees", "1 macc": "1 Maccabees", "2 mac": "2 Maccabees", "2 macc": "2 Maccabees",
  "jb": "Job", "ps": "Psalms", "psalm": "Psalms", "psa": "Psalms", "pss": "Psalms", "prov": "Proverbs", "prv": "Proverbs",
  "eccl": "Ecclesiastes", "ecc": "Ecclesiastes", "song": "Song of Solomon", "cant": "Song of Solomon", "sos": "Song of Solomon",
  "wis": "Wisdom", "sir": "Sirach", "ecclus": "Sirach", "isa": "Isaiah", "is": "Isaiah", "jer": "Jeremiah",
  "lam": "Lamentations", "bar": "Baruch", "ezek": "Ezekiel", "ez": "Ezekiel", "dan": "Daniel", "dn": "Daniel", "hos": "Hosea",
  "jl": "Joel", "am": "Amos", "ob": "Obadiah", "obad": "Obadiah", "jon": "Jonah", "mic": "Micah", "na": "Nahum", "nah": "Nahum",
  "hab": "Habakkuk", "zeph": "Zephaniah", "hag": "Haggai", "zech": "Zechariah", "mal": "Malachi",
  "matt": "Matthew", "mt": "Matthew", "mk": "Mark", "mrk": "Mark", "lk": "Luke", "jn": "John", "act": "Acts",
  "rom": "Romans", "rm": "Romans", "1 cor": "1 Corinthians", "1 co": "1 Corinthians", "2 cor": "2 Corinthians", "2 co": "2 Corinthians",
  "gal": "Galatians", "eph": "Ephesians", "phil": "Philippians", "col": "Colossians", "1 thess": "1 Thessalonians", "1 th": "1 Thessalonians", "2 thess": "2 Thessalonians", "2 th": "2 Thessalonians",
  "1 tim": "1 Timothy", "1 tm": "1 Timothy", "2 tim": "2 Timothy", "2 tm": "2 Timothy", "tit": "Titus", "ti": "Titus", "phlm": "Philemon", "heb": "Hebrews", "jas": "James", "jm": "James",
  "1 pet": "1 Peter", "1 pt": "1 Peter", "2 pet": "2 Peter", "2 pt": "2 Peter", "1 jn": "1 John", "2 jn": "2 John", "3 jn": "3 John", "jud": "Jude", "rev": "Revelation", "rv": "Revelation", "apoc": "Revelation"
};

export const DEFAULT_TRANSLATIONS: TranslationOption[] = [
  { id: 'drb', name: 'Douay-Rheims Bible', shortName: 'DRB', baseUrl: 'https://exanx.github.io/bible-json/DRB-73-Books' },
  { id: 'cpdv', name: 'Catholic Public Domain Version', shortName: 'CPDV', baseUrl: 'https://exanx.github.io/bible-json/CPDV-73-Books' },
  { id: 'web', name: 'World English Bible: Catholic Edition', shortName: 'WEBC' },
  { id: 'kjv', name: 'King James Version (Deuterocanon)', shortName: 'KJV/D' }
];

export const FAMOUS_QUOTE_VERSES = [
  { book: 'John', chapter: '3', from: '16', to: '16' },
  { book: 'Psalms', chapter: '23', from: '1', to: '6' },
  { book: 'Philippians', chapter: '4', from: '13', to: '13' },
  { book: 'Romans', chapter: '8', from: '28', to: '28' },
  { book: 'Proverbs', chapter: '3', from: '5', to: '6' },
  { book: 'Jeremiah', chapter: '29', from: '11', to: '11' },
  { book: 'Isaiah', chapter: '40', from: '31', to: '31' },
  { book: 'Genesis', chapter: '1', from: '1', to: '3' },
  { book: 'Matthew', chapter: '6', from: '33', to: '33' },
  { book: 'Psalms', chapter: '46', from: '1', to: '2' },
  { book: 'Joshua', chapter: '1', from: '9', to: '9' },
  { book: '1 Corinthians', chapter: '13', from: '4', to: '8' },
  { book: 'Micah', chapter: '6', from: '8', to: '8' },
  { book: 'Ephesians', chapter: '2', from: '8', to: '9' },
  { book: 'Hebrews', chapter: '11', from: '1', to: '1' },
  { book: 'Galatians', chapter: '5', from: '22', to: '23' },
  { book: 'Romans', chapter: '12', from: '2', to: '2' },
  { book: 'Psalms', chapter: '119', from: '105', to: '105' },
  { book: 'John', chapter: '14', from: '6', to: '6' },
  { book: 'Psalms', chapter: '121', from: '1', to: '2' },
  { book: 'Matthew', chapter: '11', from: '28', to: '30' },
  { book: 'Philippians', chapter: '4', from: '6', to: '7' },
  { book: 'Isaiah', chapter: '41', from: '10', to: '10' },
  { book: '2 Timothy', chapter: '1', from: '7', to: '7' },
  { book: '1 Peter', chapter: '5', from: '7', to: '7' },
  { book: 'Psalms', chapter: '91', from: '1', to: '2' },
  { book: 'Colossians', chapter: '3', from: '12', to: '14' },
  { book: 'Lamentations', chapter: '3', from: '22', to: '23' },
  { book: 'Psalms', chapter: '27', from: '1', to: '1' },
  { book: 'Proverbs', chapter: '4', from: '23', to: '23' }
];

export const FULL_THEMES: Record<string, FullTheme> = {
  // === MAIN ===
  amoled_black: {
    id: 'amoled_black',
    name: 'AMOLED Black',
    category: 'main',
    mode: 'dark',
    bg: '#000000',
    text: '#e4e4e7',
    font: 'Inter',
    accent: { color: '#6366f1', hover: '#4f46e5', glow: 'rgba(99, 102, 241, 0.4)' },
    desc: 'Zero-emission pitch black for OLED'
  },
  pure_white: {
    id: 'pure_white',
    name: 'Pure White',
    category: 'main',
    mode: 'light',
    bg: '#ffffff',
    text: '#18181b',
    font: 'Inter',
    accent: { color: '#4f46e5', hover: '#4338ca', glow: 'rgba(79, 70, 229, 0.35)' },
    desc: 'Crisp minimal daylight reading'
  },

  // === LIGHT ===
  golden_parchment: {
    id: 'golden_parchment',
    name: 'Golden Parchment',
    category: 'light',
    mode: 'light',
    bg: '#faedd0',
    text: '#3f2d18',
    font: 'Crimson Pro',
    accent: { color: '#d97706', hover: '#b45309', glow: 'rgba(217, 119, 6, 0.4)' },
    desc: 'Illuminated liturgical manuscript'
  },
  ancient_scroll: {
    id: 'ancient_scroll',
    name: 'Ancient Scroll',
    category: 'light',
    mode: 'light',
    bg: '#f4ebd9',
    text: '#382b1d',
    font: 'Tinos',
    accent: { color: '#c2410c', hover: '#9a3412', glow: 'rgba(194, 65, 12, 0.35)' },
    desc: 'Antiquity papyrus & gall ink'
  },
  light_rose: {
    id: 'light_rose',
    name: 'Light Rose',
    category: 'light',
    mode: 'light',
    bg: '#fdf0f2',
    text: '#4c2334',
    font: 'Playfair Display',
    accent: { color: '#e11d48', hover: '#be123c', glow: 'rgba(225, 29, 72, 0.35)' },
    desc: 'Soft blush rose quartz petal'
  },
  yellow_halo: {
    id: 'yellow_halo',
    name: 'Yellow Halo',
    category: 'light',
    mode: 'light',
    bg: '#fef9c3',
    text: '#453310',
    font: 'Crimson Pro',
    accent: { color: '#eab308', hover: '#ca8a04', glow: 'rgba(234, 179, 8, 0.45)' },
    desc: 'Divine warm golden halo',
    animated: true
  },
  soft_light: {
    id: 'soft_light',
    name: 'Soft Light',
    category: 'light',
    mode: 'light',
    bg: '#f5f5f7',
    text: '#27272a',
    font: 'Nunito',
    accent: { color: '#0ea5e9', hover: '#0284c7', glow: 'rgba(14, 165, 233, 0.35)' },
    desc: 'Low-glare daytime reading ease'
  },
  eden_sage: {
    id: 'eden_sage',
    name: 'Eden Sage',
    category: 'light',
    mode: 'light',
    bg: '#eaf4ee',
    text: '#123924',
    font: 'Lora',
    accent: { color: '#059669', hover: '#047857', glow: 'rgba(5, 150, 105, 0.4)' },
    desc: 'Serene botanical clover & fresh laurel green',
    animated: true
  },

  // === DARK ===
  red_rose: {
    id: 'red_rose',
    name: 'Red Rose',
    category: 'dark',
    mode: 'dark',
    bg: '#17070b',
    text: '#ffe4e6',
    font: 'Playfair Display',
    accent: { color: '#f43f5e', hover: '#e11d48', glow: 'rgba(244, 63, 94, 0.45)' },
    desc: 'Velvet crimson noir & ruby silk',
    animated: true
  },
  neon_blue: {
    id: 'neon_blue',
    name: 'Neon Blue',
    category: 'dark',
    mode: 'dark',
    bg: '#040a17',
    text: '#e0f2fe',
    font: 'Oswald',
    accent: { color: '#00d2ff', hover: '#0284c7', glow: 'rgba(0, 210, 255, 0.5)' },
    desc: 'Electric cobalt living waters',
    animated: true
  },
  night_sky: {
    id: 'night_sky',
    name: 'Night Sky',
    category: 'dark',
    mode: 'dark',
    bg: '#070e1c',
    text: '#e2e8f0',
    font: 'Lora',
    accent: { color: '#3b82f6', hover: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
    desc: 'Starry firmament & celestial sapphire',
    animated: true
  },
  golden_age: {
    id: 'golden_age',
    name: 'Golden Age',
    category: 'dark',
    mode: 'dark',
    bg: '#13100a',
    text: '#fef08a',
    font: 'Crimson Pro',
    accent: { color: '#f59e0b', hover: '#d97706', glow: 'rgba(245, 158, 11, 0.45)' },
    desc: 'Obsidian sanctuary & imperial gold',
    animated: true
  },
  grey_hound: {
    id: 'grey_hound',
    name: 'Grey Hound',
    category: 'dark',
    mode: 'dark',
    bg: '#16181d',
    text: '#d1d5db',
    font: 'Roboto',
    accent: { color: '#94a3b8', hover: '#64748b', glow: 'rgba(148, 163, 184, 0.35)' },
    desc: 'Tactical matte slate & cool platinum'
  },
  royal_amethyst: {
    id: 'royal_amethyst',
    name: 'Royal Amethyst',
    category: 'dark',
    mode: 'dark',
    bg: '#13091f',
    text: '#f3e8ff',
    font: 'Merriweather',
    accent: { color: '#a855f7', hover: '#9333ea', glow: 'rgba(168, 85, 247, 0.45)' },
    desc: 'Imperial liturgical violet & regal lilac',
    animated: true
  }
};

export const LIVE_EFFECT_NAMES: Record<LiveEffectId, string> = {
  theme_default: 'Theme Default',
  none: 'Static (None)',
  night_sky: 'Night Sky',
  neon_blue: 'Living Waters',
  yellow_halo: 'Divine Aureole',
  golden_age: 'Candlelight',
  red_rose: 'Velvet Crimson',
  eden_sage: 'Eden Laurel',
  royal_aurora: 'Royal Aurora',
  morning_dew: 'Dawn Radiance'
};

export const ACCENT_PRESETS = [
  { name: 'Indigo', color: '#4f46e5', hover: '#4338ca', glow: 'rgba(79, 70, 229, 0.35)' },
  { name: 'Amber', color: '#d97706', hover: '#b45309', glow: 'rgba(217, 119, 6, 0.35)' },
  { name: 'Emerald', color: '#059669', hover: '#047857', glow: 'rgba(5, 150, 105, 0.35)' },
  { name: 'Rose', color: '#e11d48', hover: '#be123c', glow: 'rgba(225, 29, 72, 0.35)' },
  { name: 'Sky', color: '#0284c7', hover: '#0369a1', glow: 'rgba(2, 132, 199, 0.35)' },
  { name: 'Purple', color: '#7c3aed', hover: '#6d28d9', glow: 'rgba(124, 58, 237, 0.35)' }
];
