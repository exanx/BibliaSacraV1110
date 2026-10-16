export interface BibleVerse {
  verse: string;
  text: string;
}

export interface BibleChapterData {
  reference: string;
  book: string;
  chapter: string;
  translation_name: string;
  verses: BibleVerse[];
}

export interface HighlightItem {
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  category?: string;
  note?: string;
  verseText?: string;
  updatedAt: number;
  deleted?: boolean;
}

export interface BookmarkItem {
  updatedAt: number;
  deleted?: boolean;
}

export interface CategoryItem {
  updatedAt: number;
  deleted?: boolean;
}

export interface LastReadPosition {
  book: string;
  chapter: string;
  verse: string;
  timestamp: number;
}

export interface AccentColor {
  color: string;
  hover: string;
  glow: string;
}

export type ThemeCategory = 'main' | 'light' | 'dark';

export interface FullTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  mode: 'light' | 'dark';
  bg: string;
  text: string;
  font: string;
  accent: AccentColor;
  desc: string;
  animated?: boolean;
}

export type LiveEffectId =
  | 'theme_default'
  | 'none'
  | 'night_sky'
  | 'neon_blue'
  | 'yellow_halo'
  | 'golden_age'
  | 'red_rose'
  | 'eden_sage'
  | 'royal_aurora'
  | 'morning_dew';

export interface CustomBible {
  id: string;
  name: string;
  url: string;
}

export interface TranslationOption {
  id: string;
  name: string;
  shortName: string;
  baseUrl?: string;
}

export interface AppSettings {
  translation: string;
  fontSize: number;
  lineRatio: number;
  fontFamily: string;
  isBold: boolean;
  contentWidth: number;
  accentColor: AccentColor;
  theme: 'light' | 'dark';
  activeThemeId: string;
  liveEffect: LiveEffectId;
  customBibles: CustomBible[];
  customFonts: string[];
  customBg: string | null;
  customText: string | null;
  updatedAt: number;
}
