import React, { useState } from 'react';
import { useBible } from '../context/BibleContext';
import { DEFAULT_TRANSLATIONS } from '../constants/bibleData';
import {
  Search,
  BookOpen,
  Volume2,
  Highlighter,
  Bookmark,
  Image as ImageIcon,
  BookA,
  Globe,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const {
    currentBook,
    currentChapter,
    directVerseSearch,
    setActiveModal,
    settings,
    updateSettings,
    startVoiceReading,
    openReferenceLookup
  } = useBible();

  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    directVerseSearch(searchInput);
    if (onCloseMobile) onCloseMobile();
  };

  const handleAction = (modal: string) => {
    setActiveModal(modal);
    if (onCloseMobile) onCloseMobile();
  };

  const handleVoiceReader = () => {
    startVoiceReading(1);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-col items-center justify-center pt-8">
        <div className="header-icon-mask h-10 w-40 mb-2" aria-label="Sancta Logo" />
        <p className="text-[9px] uppercase tracking-[0.3em] font-semibold text-primary/80">Holy Bible</p>
      </div>

      {/* Main Controls Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Direct Verse Search */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
            Search
          </label>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. Jn 3:16"
              className="glass-input w-full pl-9 pr-12 py-2.5 rounded-lg outline-none text-sm placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-secondary text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer hover:text-primary transition-colors"
            >
              GO
            </button>
          </form>
        </div>

        {/* Book & Chapter Navigation */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
            Book & Chapter
          </label>
          <button
            type="button"
            onClick={() => handleAction('grid')}
            className="w-full btn-primary flex items-center justify-between font-medium py-2.5 px-4 rounded-lg transition-all text-sm cursor-pointer shadow-sm"
          >
            <span className="truncate">{currentBook} {currentChapter}</span>
            <ChevronDown className="w-4 h-4 opacity-75 shrink-0" />
          </button>
        </div>

        {/* Translation Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
            Translation
          </label>
          <select
            value={settings.translation}
            onChange={(e) => updateSettings({ translation: e.target.value })}
            className="glass-input w-full p-2.5 rounded-lg outline-none text-sm cursor-pointer"
          >
            {DEFAULT_TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
            {settings.customBibles.length > 0 && (
              <optgroup label="Custom Bibles">
                {settings.customBibles.map((cb) => (
                  <option key={cb.id} value={`custom_${cb.id}`}>
                    {cb.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-white/5 space-y-2">
          <button
            type="button"
            onClick={handleVoiceReader}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl btn-secondary text-sm font-medium cursor-pointer transition-colors hover:border-primary/40"
          >
            <Volume2 className="w-4 h-4 text-primary" />
            <span>Voice Reader</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('highlights')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl btn-secondary text-sm font-medium cursor-pointer transition-colors hover:border-primary/40"
          >
            <Highlighter className="w-4 h-4 text-primary" />
            <span>Notes & Highlights</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('bookmarks')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl btn-secondary text-sm font-medium cursor-pointer transition-colors hover:border-primary/40"
          >
            <Bookmark className="w-4 h-4 text-primary" />
            <span>Bookmarks</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('quote')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl btn-secondary text-sm font-medium cursor-pointer transition-colors hover:border-primary/40"
          >
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>Quote Studio</span>
          </button>

          {/* Reference Lookup Split Buttons */}
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                openReferenceLookup('', 'dict');
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl btn-secondary text-xs font-medium cursor-pointer transition-colors hover:border-primary/40"
            >
              <BookA className="w-3.5 h-3.5 text-primary" />
              <span>Dictionary</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openReferenceLookup('', 'wiki');
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl btn-secondary text-xs font-medium cursor-pointer transition-colors hover:border-primary/40"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Wikipedia</span>
            </button>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => handleAction('settings')}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-gray-100 border border-gray-200/80 dark:border-white/10 shadow-xs hover:border-primary/40"
          >
            <SettingsIcon className="w-4 h-4 text-primary" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-5 border-t border-gray-200/60 dark:border-white/5 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-black/20 mt-auto">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-1">
          Biblia Sacra 3.2 Sync
        </p>
        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
          Created by{' '}
          <a
            href="https://github.com/exanx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-bold"
          >
            EXANX
          </a>
        </p>
      </div>
    </div>
  );
};
