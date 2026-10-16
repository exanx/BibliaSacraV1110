import { BIBLE_BOOKS, BOOK_ALIASES, DEFAULT_TRANSLATIONS } from '../constants/bibleData';
import { BibleChapterData, BibleVerse, TranslationOption } from '../types/bible';
import { localDB } from './storage';

const staticBookCache: Record<string, any> = {};

export function resolveTranslation(
  translationId: string,
  customBibles: { id: string; name: string; url: string }[] = []
): TranslationOption {
  const custom = customBibles.find(b => `custom_${b.id}` === translationId || b.id === translationId);
  if (custom) {
    return {
      id: `custom_${custom.id}`,
      name: custom.name,
      shortName: custom.name.slice(0, 5).toUpperCase(),
      baseUrl: custom.url
    };
  }

  const found = DEFAULT_TRANSLATIONS.find(t => t.id === translationId);
  return found || DEFAULT_TRANSLATIONS[0];
}

export async function fetchChapter(
  book: string,
  chapter: string,
  translationId: string,
  customBibles: { id: string; name: string; url: string }[] = []
): Promise<BibleChapterData> {
  const translation = resolveTranslation(translationId, customBibles);

  if (translation.baseUrl) {
    const bookUrl = `${translation.baseUrl}/${encodeURIComponent(book)}.json`;
    const cacheKey = `cached_bible_${translation.id}_${book}`;

    let bookData = staticBookCache[bookUrl];

    if (!bookData) {
      // 1. Try local cache
      const cached = await localDB.get<any>(cacheKey);
      if (cached) {
        bookData = cached;
        staticBookCache[bookUrl] = cached;
      } else {
        // 2. Fetch from network
        try {
          const res = await fetch(bookUrl);
          if (!res.ok) throw new Error(`Not Found (${res.status})`);
          bookData = await res.json();
          staticBookCache[bookUrl] = bookData;
          localDB.set(cacheKey, bookData).catch(() => {});
        } catch (netErr: any) {
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new Error(`Offline Mode: "${book}" is not downloaded yet. Go to Settings > Offline Bible Storage to download.`);
          }
          throw new Error(`Failed to load "${book}" from ${translation.name}: ${netErr.message || 'Network error'}`);
        }
      }
    }

    let verses: BibleVerse[] = [];
    if (bookData.chapters && Array.isArray(bookData.chapters)) {
      const chapObj = bookData.chapters.find((c: any) => c.chapter.toString() === chapter.toString());
      if (!chapObj || !chapObj.verses) throw new Error(`Chapter ${chapter} missing in ${book}`);
      verses = chapObj.verses.map((v: any) => ({
        verse: v.verse.toString(),
        text: (v.text || '').replace(/\n/g, ' ').trim()
      }));
    } else if (bookData[chapter]) {
      verses = Object.keys(bookData[chapter])
        .filter(key => !isNaN(Number(key)))
        .map(v => ({
          verse: v,
          text: (bookData[chapter][v] || '').replace(/\n/g, ' ').trim()
        }));
    } else {
      throw new Error(`Chapter ${chapter} is not available in ${book}`);
    }

    return {
      reference: `${book} ${chapter}`,
      book,
      chapter,
      translation_name: translation.name,
      verses
    };
  } else {
    // bible-api.com fallback
    const cacheKey = `cached_chapter_${translation.id}_${book}_${chapter}`;
    const cached = await localDB.get<any>(cacheKey);
    if (cached) {
      return {
        reference: `${book} ${chapter}`,
        book,
        chapter,
        translation_name: translation.name,
        verses: cached.verses.map((v: any) => ({
          verse: v.verse.toString(),
          text: (v.text || '').replace(/\n/g, ' ').trim()
        }))
      };
    }

    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation.id}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      localDB.set(cacheKey, data).catch(() => {});

      return {
        reference: `${book} ${chapter}`,
        book,
        chapter,
        translation_name: data.translation_name || translation.name,
        verses: (data.verses || []).map((v: any) => ({
          verse: v.verse.toString(),
          text: (v.text || '').replace(/\n/g, ' ').trim()
        }))
      };
    } catch (netErr: any) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error(`Offline Mode: "${book} ${chapter}" is not cached yet.`);
      }
      throw new Error(`Could not fetch ${book} ${chapter}: ${netErr.message || 'API error'}`);
    }
  }
}

export function parseVerseReference(input: string): { book: string; chapter: string; verse?: string } | null {
  const cleaned = input.trim();
  if (!cleaned) return null;

  // e.g. "John 3:16", "Jn 3:16", "1 John 1:9", "Genesis 1", "Gen 1:1"
  const match = cleaned.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s*(\d+)(?::(\d+))?$/);
  if (!match) return null;

  const rawBook = match[1].trim().toLowerCase();
  const chapter = match[2];
  const verse = match[3];

  let resolvedBook = BOOK_ALIASES[rawBook];
  if (!resolvedBook) {
    const allBooks = [
      ...Object.keys(BIBLE_BOOKS["Old Testament"]),
      ...Object.keys(BIBLE_BOOKS["New Testament"])
    ];
    resolvedBook = allBooks.find(b => b.toLowerCase() === rawBook);
  }

  if (!resolvedBook) return null;

  return {
    book: resolvedBook,
    chapter,
    verse
  };
}

export async function fetchQuoteText(
  book: string,
  chapter: string,
  fromVerse: string,
  toVerse: string,
  translationId: string,
  customBibles: { id: string; name: string; url: string }[] = []
): Promise<string> {
  const chapData = await fetchChapter(book, chapter, translationId, customBibles);
  const from = parseInt(fromVerse, 10) || 1;
  const to = parseInt(toVerse, 10) || from;

  const selectedVerses = chapData.verses.filter(v => {
    const num = parseInt(v.verse, 10);
    return num >= from && num <= to;
  });

  return selectedVerses.map(v => v.text).join(' ');
}

// Download whole translation offline
export async function downloadTranslationOffline(
  translationId: string,
  customBibles: { id: string; name: string; url: string }[] = [],
  onProgress?: (completed: number, total: number, currentBook: string) => void,
  shouldCancel?: () => boolean
): Promise<{ success: boolean; downloaded: number }> {
  const translation = resolveTranslation(translationId, customBibles);
  if (!translation.baseUrl) {
    throw new Error('This translation does not support full offline bulk downloading.');
  }

  const allBooks = [
    ...Object.keys(BIBLE_BOOKS["Old Testament"]),
    ...Object.keys(BIBLE_BOOKS["New Testament"])
  ];

  let completed = 0;
  for (const book of allBooks) {
    if (shouldCancel && shouldCancel()) {
      return { success: false, downloaded: completed };
    }

    const bookUrl = `${translation.baseUrl}/${encodeURIComponent(book)}.json`;
    const cacheKey = `cached_bible_${translation.id}_${book}`;

    try {
      const existing = await localDB.get(cacheKey);
      if (!existing) {
        const res = await fetch(bookUrl);
        if (res.ok) {
          const json = await res.json();
          await localDB.set(cacheKey, json);
        }
      }
    } catch (e) {
      console.warn(`Error caching ${book}:`, e);
    }

    completed++;
    if (onProgress) {
      onProgress(completed, allBooks.length, book);
    }
  }

  return { success: true, downloaded: completed };
}

export async function checkTranslationOfflineStatus(
  translationId: string,
  customBibles: { id: string; name: string; url: string }[] = []
): Promise<{ isComplete: boolean; count: number; total: number }> {
  const translation = resolveTranslation(translationId, customBibles);
  const allBooks = [
    ...Object.keys(BIBLE_BOOKS["Old Testament"]),
    ...Object.keys(BIBLE_BOOKS["New Testament"])
  ];
  const total = allBooks.length;

  const keys = await localDB.getAllKeys();
  const prefix = `cached_bible_${translation.id}_`;
  const count = keys.filter(k => k.startsWith(prefix)).length;

  return {
    isComplete: count >= total,
    count,
    total
  };
}

export async function deleteTranslationOffline(translationId: string): Promise<number> {
  const prefix = `cached_bible_${translationId}_`;
  return await localDB.deletePrefix(prefix);
}
