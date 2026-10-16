import React from 'react';
import { useBible } from './context/BibleContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ScriptureReader } from './components/ScriptureReader';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { BookChapterGridModal } from './components/BookChapterGridModal';
import { VerseActionModal } from './components/VerseActionModal';
import { QuoteStudioModal } from './components/QuoteStudioModal';
import { NotesHighlightsModal } from './components/NotesHighlightsModal';
import { BookmarksModal } from './components/BookmarksModal';
import { DictionaryWikiModal } from './components/DictionaryWikiModal';
import { SettingsModal } from './components/SettingsModal';
import { VoicePlayerBar } from './components/VoicePlayerBar';
import { WordLookupTooltip } from './components/WordLookupTooltip';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast } from './components/Toast';
import { X } from 'lucide-react';

export const App: React.FC = () => {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useBible();

  return (
    <div className="flex h-screen w-full relative z-10 selection:bg-primary/20 overflow-hidden">
      {/* Live Atmospheric Background */}
      <AtmosphericBackground />

      {/* Floating Word Lookup Tooltip */}
      <WordLookupTooltip />

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-[22rem] h-full flex-shrink-0 bg-gray-50/70 dark:bg-[#0a0a0a]/70 border-r border-gray-200 dark:border-white/5 z-20 backdrop-blur-xl">
        <Sidebar />
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-80 max-w-[85vw] h-full bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10 shadow-2xl z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
              <div className="header-icon-mask h-7 w-28" aria-label="Sancta Logo" />
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Scrollable Area */}
      <div id="main-scroll-area" className="flex-1 h-full overflow-y-auto relative">
        <Header />
        <main id="content-area" className="min-h-screen flex flex-col">
          <ScriptureReader />
        </main>
      </div>

      {/* Modals */}
      <BookChapterGridModal />
      <VerseActionModal />
      <QuoteStudioModal />
      <NotesHighlightsModal />
      <BookmarksModal />
      <DictionaryWikiModal />
      <SettingsModal />
      <ConfirmModal />

      {/* Floating Audio Player & Notifications */}
      <VoicePlayerBar />
      <Toast />
    </div>
  );
};
