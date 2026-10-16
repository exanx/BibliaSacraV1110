import React, { useState, useEffect } from 'react';
import { useBible } from '../context/BibleContext';
import {
  FULL_THEMES,
  LIVE_EFFECT_NAMES,
  ACCENT_PRESETS,
  DEFAULT_TRANSLATIONS
} from '../constants/bibleData';
import { FullTheme, LiveEffectId, ThemeCategory } from '../types/bible';
import {
  downloadTranslationOffline,
  checkTranslationOfflineStatus,
  deleteTranslationOffline
} from '../services/bibleApi';
import { localDB } from '../services/storage';
import {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from '../services/firebase';
import {
  X,
  Sun,
  Moon,
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  RotateCcw,
  AlertTriangle,
  Upload,
  Check,
  Cloud,
  CheckCircle2
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    settings,
    updateSettings,
    applyFullTheme,
    resetSettings,
    resetAllAppData,
    confirmDialog,
    showToast,
    currentUser,
    syncStatus,
    lastSyncedTime,
    syncNow
  } = useBible();

  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('main');
  const [customFontInput, setCustomFontInput] = useState<string>('');

  // Offline Bible state
  const [offlineVersion, setOfflineVersion] = useState<string>('drb');
  const [offlineStatus, setOfflineStatus] = useState<{ isComplete: boolean; count: number; total: number }>({
    isComplete: false,
    count: 0,
    total: 73
  });
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ completed: number; total: number; currentBook: string }>({
    completed: 0,
    total: 73,
    currentBook: ''
  });
  const cancelDownloadRef = React.useRef<boolean>(false);

  // Custom Bible inputs
  const [customBibleName, setCustomBibleName] = useState<string>('');
  const [customBibleUrl, setCustomBibleUrl] = useState<string>('');
  const [showCustomBibleHelp, setShowCustomBibleHelp] = useState<boolean>(false);

  // Check offline status on open or translation change
  useEffect(() => {
    if (activeModal === 'settings') {
      checkTranslationOfflineStatus(offlineVersion, settings.customBibles).then(setOfflineStatus);
    }
  }, [activeModal, offlineVersion, settings.customBibles]);

  if (activeModal !== 'settings') return null;

  const currentTheme = FULL_THEMES[settings.activeThemeId] || FULL_THEMES.amoled_black;

  // Handle Offline Download
  const handleStartDownload = async () => {
    setIsDownloading(true);
    cancelDownloadRef.current = false;
    try {
      const res = await downloadTranslationOffline(
        offlineVersion,
        settings.customBibles,
        (completed, total, currentBook) => {
          setDownloadProgress({ completed, total, currentBook });
        },
        () => cancelDownloadRef.current
      );

      if (res.success) {
        showToast('All 73 books downloaded for offline reading!');
      } else {
        showToast('Download was cancelled.');
      }
      checkTranslationOfflineStatus(offlineVersion, settings.customBibles).then(setOfflineStatus);
    } catch (e: any) {
      showToast(e.message || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelDownload = () => {
    cancelDownloadRef.current = true;
  };

  const handleDeleteOffline = async () => {
    const confirmed = await confirmDialog({
      title: 'Clear Offline Translation?',
      message: 'Are you sure you want to remove the downloaded offline copy of this translation?',
      confirmText: 'Clear Cache',
      type: 'danger'
    });
    if (!confirmed) return;

    await deleteTranslationOffline(offlineVersion);
    checkTranslationOfflineStatus(offlineVersion, settings.customBibles).then(setOfflineStatus);
    showToast('Offline cache cleared.');
  };

  // Add Custom Google Font
  const handleAddCustomFont = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customFontInput.trim();
    if (!name) return;
    if (settings.customFonts.includes(name)) {
      showToast('Font already added.');
      return;
    }
    const updated = [...settings.customFonts, name];
    updateSettings({ customFonts: updated, fontFamily: name });
    setCustomFontInput('');
    showToast(`Added Google Font "${name}"`);
  };

  const handleRemoveCustomFont = async (font: string) => {
    const updated = settings.customFonts.filter((f) => f !== font);
    updateSettings({
      customFonts: updated,
      fontFamily: settings.fontFamily === font ? 'Inter' : settings.fontFamily
    });
    showToast(`Removed font "${font}"`);
  };

  // Add Custom Bible
  const handleAddCustomBible = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customBibleName.trim();
    const url = customBibleUrl.trim().replace(/\/$/, '');
    if (!name || !url) return;

    const newBible = {
      id: Date.now().toString(),
      name,
      url
    };
    const updated = [...settings.customBibles, newBible];
    updateSettings({ customBibles: updated, translation: `custom_${newBible.id}` });
    setCustomBibleName('');
    setCustomBibleUrl('');
    showToast(`Added custom translation "${name}"`);
  };

  const handleRemoveCustomBible = async (id: string, name: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete Custom Translation?',
      message: `Are you sure you want to remove "${name}"?`,
      confirmText: 'Delete',
      type: 'danger'
    });
    if (!confirmed) return;

    const updated = settings.customBibles.filter((b) => b.id !== id);
    updateSettings({
      customBibles: updated,
      translation: settings.translation === `custom_${id}` ? 'drb' : settings.translation
    });
    showToast(`Removed translation "${name}"`);
  };

  // Backup export / import
  const handleExportBackup = async () => {
    const data = (await localDB.get('bible_data')) || {};
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BibliaSacra_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup data exported!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await localDB.set('bible_data', json);
        showToast('Backup restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Google Sign In
  const handleGoogleLogin = async () => {
    if (!auth) {
      showToast('Firebase not initialized.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast('Signed in successfully!');
    } catch (e: any) {
      showToast(`Login failed: ${e.message || 'Error'}`);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    const confirmed = await confirmDialog({
      title: 'Sign out of Account?',
      message: 'Pending cloud changes will be synced first.',
      confirmText: 'Sign Out',
      type: 'warning'
    });
    if (!confirmed) return;

    await signOut(auth);
    showToast('Signed out.');
  };

  // Filter themes by category
  const categoryThemes = Object.values(FULL_THEMES).filter((t) => t.category === activeCategory);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 transition-opacity"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="glass-panel modal-enter w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-black/40">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Settings</h3>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 overflow-y-auto space-y-7">
          {/* 1. Live Reading Preview Card */}
          <div className="glass-input rounded-2xl p-4 border border-gray-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Live Reading Preview
                </span>
              </div>
              <div className="text-[10px] font-mono text-gray-400">
                <span className="text-primary font-bold">{settings.fontFamily}</span> • {settings.contentWidth}% width
              </div>
            </div>

            <div className="w-full bg-gray-100/70 dark:bg-black/50 rounded-xl p-3 flex justify-center items-center overflow-hidden min-h-[140px]">
              <div
                className="rounded-xl p-4 shadow-sm border border-gray-200/60 dark:border-white/5 transition-all duration-200"
                style={{
                  width: `${settings.contentWidth}%`,
                  backgroundColor: settings.customBg || currentTheme.bg,
                  color: settings.customText || currentTheme.text,
                  fontFamily: `"${settings.fontFamily}", sans-serif`,
                  fontSize: `calc(0.9rem * ${settings.fontSize})`,
                  lineHeight: settings.lineRatio,
                  fontWeight: settings.isBold ? 600 : 400
                }}
              >
                <h4 className="text-base font-bold mb-1.5 tracking-tight">John 1:1–2</h4>
                <div className="space-y-1 text-xs">
                  <p>
                    <sup className="text-[10px] text-gray-400 font-bold mr-1 select-none">1</sup>
                    In the beginning was the Word, and the Word was with God, and the Word was God.
                  </p>
                  <p>
                    <sup className="text-[10px] text-gray-400 font-bold mr-1 select-none">2</sup>
                    <span className="highlight-yellow px-1 py-0.5 rounded">
                      The same was in the beginning with God.
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 px-1">
              <span>Font, width, themes & colors apply instantly</span>
              <span className="font-bold text-primary">{currentTheme.name}</span>
            </div>
          </div>

          {/* 2. Full Themes Grid */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Full Curated Themes
                </label>
                <p className="text-[11px] text-gray-400">Complete palette, canvas, accent & typography</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {currentTheme.name}
              </span>
            </div>

            {/* Category Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl gap-1 mb-3">
              {(['main', 'light', 'dark'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white dark:bg-white/10 text-primary shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cat} ({cat === 'main' ? 2 : 6})
                </button>
              ))}
            </div>

            {/* Themes Cards */}
            <div className="grid grid-cols-2 gap-2">
              {categoryThemes.map((th) => {
                const isActive = settings.activeThemeId === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => applyFullTheme(th.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isActive
                        ? 'ring-2 ring-primary border-primary shadow-sm bg-primary/5'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 glass-input'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="font-bold text-xs truncate text-gray-900 dark:text-white">
                        {th.name}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </div>

                    <p className="text-[10px] text-gray-400 line-clamp-1">{th.desc}</p>

                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-white/20"
                        style={{ backgroundColor: th.bg }}
                        title="Canvas background"
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: th.accent.color }}
                        title="Accent"
                      />
                      <span className="text-[9px] font-mono text-gray-400 ml-auto">{th.font}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Live Atmospheric Background Effects */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-white/5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Live Atmospheric Effects
              </label>
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {LIVE_EFFECT_NAMES[settings.liveEffect] || 'Theme Default'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-2.5">
              Subtle ambient celestial, candlelight and water motion
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(Object.keys(LIVE_EFFECT_NAMES) as LiveEffectId[]).map((effId) => {
                const isSelected = settings.liveEffect === effId;
                return (
                  <button
                    key={effId}
                    type="button"
                    onClick={() => updateSettings({ liveEffect: effId })}
                    className={`text-left p-2 rounded-xl border glass-input transition-all text-xs flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-primary border-primary font-bold'
                        : 'border-gray-200/80 dark:border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <span className="truncate">{LIVE_EFFECT_NAMES[effId]}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Appearance & Colors */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-white/5 space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Appearance & Colors
            </label>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="w-full flex items-center justify-between p-2.5 rounded-xl glass-input font-medium text-xs text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <span>Color Mode ({settings.theme === 'dark' ? 'Dark' : 'Light'})</span>
              {settings.theme === 'dark' ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Accent Presets */}
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Accent Color</span>
              <div className="flex items-center gap-2">
                {ACCENT_PRESETS.map((acc) => {
                  const isCur = settings.accentColor.color === acc.color;
                  return (
                    <button
                      key={acc.name}
                      type="button"
                      onClick={() => updateSettings({ accentColor: acc })}
                      style={{ backgroundColor: acc.color }}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        isCur ? 'scale-125 ring-2 ring-offset-2 ring-primary' : 'hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                      title={acc.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Custom Canvas Colors */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Custom Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.customBg || currentTheme.bg}
                    onChange={(e) => updateSettings({ customBg: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-500">
                    {settings.customBg || currentTheme.bg}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Custom Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.customText || currentTheme.text}
                    onChange={(e) => updateSettings({ customText: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-500">
                    {settings.customText || currentTheme.text}
                  </span>
                </div>
              </div>
            </div>
            {(settings.customBg || settings.customText) && (
              <button
                type="button"
                onClick={() => updateSettings({ customBg: null, customText: null })}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                Reset to theme defaults
              </button>
            )}
          </div>

          {/* 5. Typography & Formatting */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-white/5 space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Typography & Formatting
            </label>

            {/* Font Family Select */}
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Font Family</span>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                className="glass-input w-full p-2.5 rounded-lg text-xs outline-none cursor-pointer"
              >
                <optgroup label="Sans-Serif">
                  <option value="Inter">Inter (Modern)</option>
                  <option value="Roboto">Roboto (Clean)</option>
                  <option value="Open Sans">Open Sans (Neutral)</option>
                  <option value="Lato">Lato (Warm)</option>
                  <option value="Nunito">Nunito (Rounded)</option>
                  <option value="Quicksand">Quicksand (Soft)</option>
                </optgroup>
                <optgroup label="Serif">
                  <option value="Lora">Lora (Elegant)</option>
                  <option value="Merriweather">Merriweather (Readable)</option>
                  <option value="Tinos">Tinos (Classic)</option>
                  <option value="Crimson Pro">Crimson Pro (Traditional)</option>
                  <option value="Playfair Display">Playfair Display</option>
                </optgroup>
                <optgroup label="Condensed">
                  <option value="Oswald">Oswald (Impactful)</option>
                </optgroup>
                {settings.customFonts.length > 0 && (
                  <optgroup label="Custom Google Fonts">
                    {settings.customFonts.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Add Custom Google Font */}
            <form onSubmit={handleAddCustomFont} className="flex gap-2">
              <input
                type="text"
                value={customFontInput}
                onChange={(e) => setCustomFontInput(e.target.value)}
                placeholder="Add Google Font (e.g. Spectral, Alegreya)..."
                className="glass-input flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
              />
              <button
                type="submit"
                className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add Font
              </button>
            </form>

            {/* Font Size & Line Spacing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Font Size</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ fontSize: Math.max(0.75, settings.fontSize - 0.125) })}
                    className="btn-secondary px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    A-
                  </button>
                  <span className="text-xs font-mono font-bold text-primary">
                    {Math.round(settings.fontSize * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => updateSettings({ fontSize: Math.min(2.0, settings.fontSize + 0.125) })}
                    className="btn-secondary px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Line Spacing</span>
                <div className="flex items-center gap-1">
                  {[1.5, 1.75, 2.0].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => updateSettings({ lineRatio: ratio })}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        settings.lineRatio === ratio ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {ratio}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Width */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-gray-400 mb-1">
                <span>Reading Column Width</span>
                <span className="text-primary font-mono">{settings.contentWidth}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={100}
                value={settings.contentWidth}
                onChange={(e) => updateSettings({ contentWidth: parseInt(e.target.value, 10) })}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* 6. Offline Bible Storage */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Offline Bible Storage
                </label>
                <p className="text-[11px] text-gray-400">Cache full 73-book Catholic scriptures to your device</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                offlineStatus.isComplete
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-zinc-800'
              }`}>
                {offlineStatus.isComplete ? 'Fully Downloaded' : `${offlineStatus.count}/${offlineStatus.total} Books`}
              </span>
            </div>

            <div className="flex gap-2">
              <select
                value={offlineVersion}
                onChange={(e) => setOfflineVersion(e.target.value)}
                className="glass-input flex-1 p-2 rounded-lg text-xs outline-none cursor-pointer"
              >
                <option value="drb">Douay-Rheims Bible (73 Books)</option>
                <option value="cpdv">Catholic Public Domain Version (73 Books)</option>
              </select>

              {offlineStatus.count > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteOffline}
                  className="btn-secondary text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  title="Clear offline cache"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isDownloading ? (
              <div className="space-y-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-primary">Downloading {downloadProgress.currentBook}...</span>
                  <span>{downloadProgress.completed} / {downloadProgress.total}</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${Math.round((downloadProgress.completed / downloadProgress.total) * 100)}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCancelDownload}
                  className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                >
                  Cancel Download
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartDownload}
                className="w-full btn-secondary py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:border-primary/40 cursor-pointer"
              >
                <Download className="w-4 h-4 text-primary" />
                <span>Download Entire Translation Offline</span>
              </button>
            )}
          </div>

          {/* 7. Backup & Restore */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-white/5 space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Backup & Data Management
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="btn-secondary p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="btn-secondary p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>Restore Backup (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetSettings}
                className="flex-1 btn-secondary py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset Settings
              </button>
              <button
                type="button"
                onClick={resetAllAppData}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors cursor-pointer"
              >
                Factory Reset
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/30 flex justify-end">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="btn-primary px-6 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
