import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  BibleChapterData,
  BibleVerse,
  HighlightItem,
  BookmarkItem,
  CategoryItem,
  LastReadPosition,
  AppSettings,
  FullTheme,
  LiveEffectId
} from '../types/bible';
import { BIBLE_BOOKS, FLAT_BIBLE, FULL_THEMES } from '../constants/bibleData';
import { fetchChapter, parseVerseReference } from '../services/bibleApi';
import { localDB } from '../services/storage';
import { voiceReader } from '../services/speechSynthesis';
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, User } from '../services/firebase';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

interface BibleContextType {
  // Reading state
  currentBook: string;
  currentChapter: string;
  loadedChapters: BibleChapterData[];
  isLoadingChapter: boolean;
  chapterError: string | null;

  // Navigation
  goToChapter: (book: string, chapter: string, targetVerse?: string) => Promise<void>;
  goToNextChapter: () => Promise<void>;
  goToPrevChapter: () => Promise<void>;
  directVerseSearch: (query: string) => Promise<boolean>;

  // Data & Annotations
  highlights: Record<string, HighlightItem>;
  bookmarks: Record<string, BookmarkItem>;
  categories: Record<string, CategoryItem>;
  setHighlight: (ref: string, color: HighlightItem['color'], category?: string, note?: string, verseText?: string) => void;
  removeHighlight: (ref: string) => void;
  toggleBookmark: (ref: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
  updateNote: (ref: string, noteText: string, category?: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  applyFullTheme: (themeId: string) => void;
  resetSettings: () => void;
  resetAllAppData: () => Promise<void>;

  // Modals & UI Controls
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  activeVerseRef: string | null;
  setActiveVerseRef: (ref: string | null) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Toast & Confirm
  toastMessage: string | null;
  showToast: (msg: string) => void;
  confirmDialog: (opts: ConfirmOptions) => Promise<boolean>;
  confirmState: { isOpen: boolean; opts: ConfirmOptions; resolve: (val: boolean) => void } | null;
  closeConfirm: (result: boolean) => void;

  // Audio Reader
  startVoiceReading: (fromVerse?: number) => void;

  // Cloud Sync & Auth
  currentUser: User | null;
  syncStatus: 'synced' | 'syncing' | 'pending' | 'offline' | 'error';
  lastSyncedTime: number | null;
  syncNow: () => Promise<void>;
  isOnline: boolean;

  // Reference Lookup
  referenceLookupWord: string;
  referenceLookupMode: 'dict' | 'wiki';
  openReferenceLookup: (word: string, mode?: 'dict' | 'wiki') => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  translation: 'drb',
  fontSize: 1.125,
  lineRatio: 1.75,
  fontFamily: 'Inter',
  isBold: false,
  contentWidth: 100,
  accentColor: { color: '#4f46e5', hover: '#4338ca', glow: 'rgba(79, 70, 229, 0.35)' },
  theme: 'dark',
  activeThemeId: 'amoled_black',
  liveEffect: 'theme_default',
  customBibles: [],
  customFonts: [],
  customBg: null,
  customText: null,
  updatedAt: Date.now()
};

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBook, setCurrentBook] = useState<string>('Genesis');
  const [currentChapter, setCurrentChapter] = useState<string>('1');
  const [loadedChapters, setLoadedChapters] = useState<BibleChapterData[]>([]);
  const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(true);
  const [chapterError, setChapterError] = useState<string | null>(null);

  const [highlights, setHighlights] = useState<Record<string, HighlightItem>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkItem>>({});
  const [categories, setCategories] = useState<Record<string, CategoryItem>>({
    'General': { updatedAt: Date.now() },
    'Faith': { updatedAt: Date.now() },
    'Prayer': { updatedAt: Date.now() }
  });
  const [lastRead, setLastRead] = useState<LastReadPosition>({
    book: 'Genesis',
    chapter: '1',
    verse: '1',
    timestamp: Date.now()
  });

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeVerseRef, setActiveVerseRef] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);

  // Confirm Modal
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    opts: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  // Sync & User
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'pending' | 'offline' | 'error'>('offline');
  const [lastSyncedTime, setLastSyncedTime] = useState<number | null>(null);
  const dirtySections = useRef<Set<string>>(new Set());
  const flushTimer = useRef<any>(null);

  // Network
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Reference Lookup
  const [referenceLookupWord, setReferenceLookupWord] = useState<string>('');
  const [referenceLookupMode, setReferenceLookupMode] = useState<'dict' | 'wiki'>('dict');

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const confirmDialog = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        opts,
        resolve
      });
    });
  }, []);

  const closeConfirm = useCallback((result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  }, [confirmState]);

  // Apply CSS variables & attributes to document.body & html
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--font-size-base', `${settings.fontSize}rem`);
    root.style.setProperty('--line-height-ratio', `${settings.lineRatio}`);
    root.style.setProperty('--font-family-base', `"${settings.fontFamily}", sans-serif`);
    root.style.setProperty('--font-weight-base', settings.isBold ? '600' : '400');
    root.style.setProperty('--content-width', `${settings.contentWidth}`);

    if (settings.accentColor) {
      root.style.setProperty('--color-primary', settings.accentColor.color);
      root.style.setProperty('--color-primary-hover', settings.accentColor.hover);
      root.style.setProperty('--color-primary-glow', settings.accentColor.glow);
    }

    if (settings.customBg) {
      body.style.setProperty('--custom-bg', settings.customBg);
    } else {
      body.style.removeProperty('--custom-bg');
    }

    if (settings.customText) {
      body.style.setProperty('--custom-text', settings.customText);
    } else {
      body.style.removeProperty('--custom-text');
    }

    body.dataset.activeTheme = settings.activeThemeId;

    let resolvedEffect = settings.liveEffect;
    if (resolvedEffect === 'theme_default') {
      const currentTh = FULL_THEMES[settings.activeThemeId];
      resolvedEffect = (currentTh && currentTh.animated) ? (currentTh.id as LiveEffectId) : 'none';
    }
    body.dataset.liveEffect = resolvedEffect;

    // Dynamically inject custom fonts if any
    settings.customFonts.forEach(font => {
      const fontId = `custom-font-${font.replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [settings]);

  // Network detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Back Online — All features connected');
      scheduleCloudFlush();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode — Reading from device cache');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Auth observer
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
      if (user) {
        setSyncStatus('syncing');
        pullFromCloud(user);
      } else {
        setSyncStatus('offline');
      }
    });
    return () => unsub();
  }, []);

  // Initial load from local DB
  useEffect(() => {
    const initData = async () => {
      try {
        const localData = await localDB.get<any>('bible_data');
        if (localData) {
          if (localData.settings) {
            setSettings(prev => ({ ...prev, ...localData.settings }));
          }
          if (localData.highlights) setHighlights(localData.highlights);
          if (localData.bookmarks) setBookmarks(localData.bookmarks);
          if (localData.categories) setCategories(localData.categories);
          if (localData.lastRead) {
            setLastRead(localData.lastRead);
            setCurrentBook(localData.lastRead.book);
            setCurrentChapter(localData.lastRead.chapter);
          }
        }
      } catch (err) {
        console.warn('Initial local DB load error:', err);
      }
    };
    initData();
  }, []);

  // Save to Local DB whenever state changes
  const saveToLocal = useCallback(async (
    newSettings?: AppSettings,
    newHighlights?: Record<string, HighlightItem>,
    newBookmarks?: Record<string, BookmarkItem>,
    newCategories?: Record<string, CategoryItem>,
    newLastRead?: LastReadPosition
  ) => {
    const dataToSave = {
      settings: newSettings || settings,
      highlights: newHighlights || highlights,
      bookmarks: newBookmarks || bookmarks,
      categories: newCategories || categories,
      lastRead: newLastRead || lastRead
    };
    await localDB.set('bible_data', dataToSave);
  }, [settings, highlights, bookmarks, categories, lastRead]);

  // Cloud Sync Flush
  const scheduleCloudFlush = useCallback(() => {
    if (!currentUser || !db) return;
    setSyncStatus('pending');
    if (flushTimer.current) clearTimeout(flushTimer.current);

    flushTimer.current = setTimeout(async () => {
      if (dirtySections.current.size === 0) {
        setSyncStatus('synced');
        return;
      }
      setSyncStatus('syncing');

      const payload: any = {};
      if (dirtySections.current.has('settings')) payload.settings = settings;
      if (dirtySections.current.has('highlights')) payload.highlights = highlights;
      if (dirtySections.current.has('bookmarks')) payload.bookmarks = bookmarks;
      if (dirtySections.current.has('categories')) payload.categories = categories;
      if (dirtySections.current.has('lastRead')) payload.lastRead = lastRead;

      try {
        await setDoc(doc(db, 'users', currentUser.uid), payload, { merge: true });
        dirtySections.current.clear();
        setLastSyncedTime(Date.now());
        setSyncStatus('synced');
      } catch (e) {
        console.warn('Cloud flush error:', e);
        setSyncStatus('error');
      }
    }, 5000);
  }, [currentUser, settings, highlights, bookmarks, categories, lastRead]);

  const pullFromCloud = async (user: User) => {
    if (!db) return;
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const cloud = snap.data();
        if (cloud.settings) {
          setSettings(prev => ({ ...prev, ...cloud.settings }));
        }
        if (cloud.highlights) setHighlights(prev => ({ ...prev, ...cloud.highlights }));
        if (cloud.bookmarks) setBookmarks(prev => ({ ...prev, ...cloud.bookmarks }));
        if (cloud.categories) setCategories(prev => ({ ...prev, ...cloud.categories }));
        if (cloud.lastRead) {
          setLastRead(cloud.lastRead);
          setCurrentBook(cloud.lastRead.book);
          setCurrentChapter(cloud.lastRead.chapter);
        }
        setLastSyncedTime(Date.now());
        setSyncStatus('synced');
      } else {
        // Initial seed
        dirtySections.current.add('settings');
        dirtySections.current.add('highlights');
        dirtySections.current.add('bookmarks');
        dirtySections.current.add('categories');
        dirtySections.current.add('lastRead');
        scheduleCloudFlush();
      }
    } catch (e) {
      console.warn('Cloud pull error:', e);
      setSyncStatus('error');
    }
  };

  const syncNow = async () => {
    if (!currentUser || !db) return;
    setSyncStatus('syncing');
    showToast('Syncing with cloud...');
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        settings,
        highlights,
        bookmarks,
        categories,
        lastRead
      }, { merge: true });
      dirtySections.current.clear();
      setLastSyncedTime(Date.now());
      setSyncStatus('synced');
      showToast('Sync complete!');
    } catch (e) {
      setSyncStatus('error');
      showToast('Sync failed: offline or permission issue');
    }
  };

  // Load Chapter
  const loadChapterData = useCallback(async (book: string, chapter: string, targetVerse?: string) => {
    setIsLoadingChapter(true);
    setChapterError(null);
    try {
      const data = await fetchChapter(book, chapter, settings.translation, settings.customBibles);
      setLoadedChapters([data]);
      setCurrentBook(book);
      setCurrentChapter(chapter);

      const newPos: LastReadPosition = {
        book,
        chapter,
        verse: targetVerse || '1',
        timestamp: Date.now()
      };
      setLastRead(newPos);
      saveToLocal(undefined, undefined, undefined, undefined, newPos);
      dirtySections.current.add('lastRead');
      scheduleCloudFlush();

      if (targetVerse) {
        setTimeout(() => {
          const el = document.querySelector(`[data-verse-ref="${book} ${chapter}:${targetVerse}"]`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setChapterError(err.message || 'Failed to load chapter');
    } finally {
      setIsLoadingChapter(false);
    }
  }, [settings.translation, settings.customBibles, saveToLocal, scheduleCloudFlush]);

  // Load initial chapter on mount or translation change
  useEffect(() => {
    loadChapterData(currentBook, currentChapter);
  }, [settings.translation]);

  const goToChapter = async (book: string, chapter: string, targetVerse?: string) => {
    voiceReader.stop();
    setIsMobileSidebarOpen(false);
    setActiveModal(null);
    await loadChapterData(book, chapter, targetVerse);
  };

  const goToNextChapter = async () => {
    const idx = FLAT_BIBLE.findIndex(b => b.book === currentBook && b.chapter === currentChapter);
    if (idx >= 0 && idx < FLAT_BIBLE.length - 1) {
      const next = FLAT_BIBLE[idx + 1];
      await goToChapter(next.book, next.chapter);
    }
  };

  const goToPrevChapter = async () => {
    const idx = FLAT_BIBLE.findIndex(b => b.book === currentBook && b.chapter === currentChapter);
    if (idx > 0) {
      const prev = FLAT_BIBLE[idx - 1];
      await goToChapter(prev.book, prev.chapter);
    }
  };

  const directVerseSearch = async (query: string): Promise<boolean> => {
    const parsed = parseVerseReference(query);
    if (parsed) {
      await goToChapter(parsed.book, parsed.chapter, parsed.verse);
      showToast(`Jumped to ${parsed.book} ${parsed.chapter}${parsed.verse ? `:${parsed.verse}` : ''}`);
      return true;
    }
    showToast(`Could not recognize reference "${query}". Try e.g. "Jn 3:16" or "Gen 1".`);
    return false;
  };

  // Annotations
  const setHighlight = (ref: string, color: HighlightItem['color'], category = 'General', note = '', verseText = '') => {
    const newItems = {
      ...highlights,
      [ref]: {
        color,
        category,
        note,
        verseText,
        updatedAt: Date.now()
      }
    };
    setHighlights(newItems);
    saveToLocal(undefined, newItems);
    dirtySections.current.add('highlights');
    scheduleCloudFlush();
    showToast(`Highlighted ${ref}`);
  };

  const removeHighlight = (ref: string) => {
    const newItems = {
      ...highlights,
      [ref]: {
        ...highlights[ref],
        deleted: true,
        updatedAt: Date.now()
      }
    };
    setHighlights(newItems);
    saveToLocal(undefined, newItems);
    dirtySections.current.add('highlights');
    scheduleCloudFlush();
    showToast(`Removed highlight on ${ref}`);
  };

  const toggleBookmark = (ref: string) => {
    const isBookmarked = bookmarks[ref] && !bookmarks[ref].deleted;
    const newItems = {
      ...bookmarks,
      [ref]: {
        updatedAt: Date.now(),
        deleted: isBookmarked
      }
    };
    setBookmarks(newItems);
    saveToLocal(undefined, undefined, newItems);
    dirtySections.current.add('bookmarks');
    scheduleCloudFlush();
    showToast(isBookmarked ? `Removed bookmark ${ref}` : `Bookmarked ${ref}`);
  };

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newCats = {
      ...categories,
      [trimmed]: { updatedAt: Date.now() }
    };
    setCategories(newCats);
    saveToLocal(undefined, undefined, undefined, newCats);
    dirtySections.current.add('categories');
    scheduleCloudFlush();
  };

  const deleteCategory = (name: string) => {
    const newCats = {
      ...categories,
      [name]: { updatedAt: Date.now(), deleted: true }
    };
    setCategories(newCats);
    saveToLocal(undefined, undefined, undefined, newCats);
    dirtySections.current.add('categories');
    scheduleCloudFlush();
  };

  const updateNote = (ref: string, noteText: string, category = 'General') => {
    const existing = highlights[ref];
    const newItems = {
      ...highlights,
      [ref]: {
        color: existing ? existing.color : 'yellow',
        category,
        note: noteText,
        verseText: existing ? existing.verseText : '',
        updatedAt: Date.now()
      }
    };
    setHighlights(newItems);
    saveToLocal(undefined, newItems);
    dirtySections.current.add('highlights');
    scheduleCloudFlush();
    showToast(`Saved note for ${ref}`);
  };

  // Settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates, updatedAt: Date.now() };
    setSettings(newSettings);
    saveToLocal(newSettings);
    dirtySections.current.add('settings');
    scheduleCloudFlush();
  };

  const applyFullTheme = (themeId: string) => {
    const th = FULL_THEMES[themeId];
    if (!th) return;
    const updates: Partial<AppSettings> = {
      activeThemeId: th.id,
      theme: th.mode,
      fontFamily: th.font,
      accentColor: th.accent,
      customBg: null,
      customText: null
    };
    updateSettings(updates);
    showToast(`Applied theme "${th.name}"`);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveToLocal(DEFAULT_SETTINGS);
    dirtySections.current.add('settings');
    scheduleCloudFlush();
    showToast('Settings reset to default');
  };

  const resetAllAppData = async () => {
    const confirmed = await confirmDialog({
      title: 'Factory Reset All Data?',
      message: 'This will permanently erase all local and cloud bookmarks, highlights, notes, offline downloaded Bibles, and custom settings. This cannot be undone.',
      confirmText: 'Erase Everything',
      type: 'danger'
    });
    if (!confirmed) return;

    if (currentUser && db) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {});
      } catch (e) {}
    }
    localStorage.clear();
    indexedDB.deleteDatabase('SanctaBibliaDB');
    window.location.reload();
  };

  const startVoiceReading = (fromVerse = 1) => {
    if (loadedChapters.length > 0) {
      const chap = loadedChapters[0];
      voiceReader.start(chap.book, chap.chapter, chap.verses, fromVerse);
    }
  };

  const openReferenceLookup = (word: string, mode: 'dict' | 'wiki' = 'dict') => {
    setReferenceLookupWord(word);
    setReferenceLookupMode(mode);
    setActiveModal('dict');
  };

  return (
    <BibleContext.Provider
      value={{
        currentBook,
        currentChapter,
        loadedChapters,
        isLoadingChapter,
        chapterError,
        goToChapter,
        goToNextChapter,
        goToPrevChapter,
        directVerseSearch,
        highlights,
        bookmarks,
        categories,
        setHighlight,
        removeHighlight,
        toggleBookmark,
        addCategory,
        deleteCategory,
        updateNote,
        settings,
        updateSettings,
        applyFullTheme,
        resetSettings,
        resetAllAppData,
        activeModal,
        setActiveModal,
        activeVerseRef,
        setActiveVerseRef,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toastMessage,
        showToast,
        confirmDialog,
        confirmState,
        closeConfirm,
        startVoiceReading,
        currentUser,
        syncStatus,
        lastSyncedTime,
        syncNow,
        isOnline,
        referenceLookupWord,
        referenceLookupMode,
        openReferenceLookup
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export const useBible = () => {
  const context = useContext(BibleContext);
  if (!context) throw new Error('useBible must be used within a BibleProvider');
  return context;
};
