import React from 'react';
import { useBible } from '../context/BibleContext';
import { resolveTranslation } from '../services/bibleApi';
import { Menu, ChevronDown, Image as ImageIcon, Bookmark, Settings as SettingsIcon, Volume2 } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    setActiveModal,
    setIsMobileSidebarOpen,
    startVoiceReading,
    settings
  } = useBible();

  const currentTranslation = resolveTranslation(settings.translation, settings.customBibles);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="fixed top-0 w-full z-30 glass-nav px-3 py-2.5 flex justify-between items-center lg:hidden transition-transform">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Menu"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveModal('quote')}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Quote Maker"
            title="Quote Maker"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        <div
          onClick={() => setActiveModal('grid')}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer group px-2 min-w-0"
        >
          <div className="flex items-center gap-1.5 max-w-full">
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
              {currentBook} {currentChapter}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
          </div>
          <p className="text-[9px] uppercase tracking-widest font-semibold text-primary mt-0.5 truncate">
            {currentTranslation.shortName || currentTranslation.name}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveModal('highlights')}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Notes & Highlights"
            title="Notes & Highlights"
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveModal('settings')}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop Top Chapter Indicator */}
      <div className="hidden lg:flex flex-col items-center justify-center mb-10 group">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveModal('grid')}
            className="inline-flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer group/title"
          >
            <span className="text-base font-bold tracking-wide group-hover/title:text-primary transition-colors">
              {currentBook} {currentChapter}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover/title:text-primary transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => startVoiceReading(1)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Listen to current chapter"
          >
            <Volume2 className="w-4 h-4 text-primary" />
            <span>Listen</span>
          </button>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-500 mt-1">
          {currentTranslation.name}
        </p>
      </div>
    </>
  );
};
