import React, { useState } from 'react';
import { useBible } from '../context/BibleContext';
import { BIBLE_BOOKS } from '../constants/bibleData';
import { X, Bookmark, Search, Trash2, Plus } from 'lucide-react';

export const BookmarksModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    bookmarks,
    toggleBookmark,
    goToChapter,
    currentBook,
    currentChapter
  } = useBible();

  const [search, setSearch] = useState<string>('');

  if (activeModal !== 'bookmarks') return null;

  const activeBookmarks = Object.keys(bookmarks)
    .filter((ref) => !bookmarks[ref].deleted)
    .map((ref) => ({ ref, ...bookmarks[ref] }))
    .filter((bm) => {
      if (!search.trim()) return true;
      return bm.ref.toLowerCase().includes(search.toLowerCase().trim());
    })
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const handleJump = (ref: string) => {
    const parts = ref.match(/(.*?)\s+(\d+)(?::(\d+))?/);
    if (parts) {
      goToChapter(parts[1], parts[2], parts[3]);
      setActiveModal(null);
    }
  };

  const handleBookmarkCurrent = () => {
    const currentRef = `${currentBook} ${currentChapter}:1`;
    toggleBookmark(currentRef);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 transition-opacity"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="glass-panel modal-enter w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-black/40">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Bookmarks</h3>
            <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {activeBookmarks.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkCurrent}
              className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bookmark Current ({currentBook} {currentChapter})</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter bookmarks..."
              className="glass-input w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {activeBookmarks.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark className="w-10 h-10 text-gray-400 mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No bookmarks saved yet</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Save chapters or individual verses for one-tap access across devices.
              </p>
            </div>
          ) : (
            activeBookmarks.map((bm) => {
              const parts = bm.ref.match(/(.*?)\s+(\d+)(?::(\d+))?/);
              const bName = parts ? parts[1] : bm.ref;
              const isNT = !!BIBLE_BOOKS["New Testament"][bName];

              return (
                <div
                  key={bm.ref}
                  className="glass-input p-3 rounded-xl flex items-center justify-between gap-3 group hover:border-primary/40 transition-all"
                >
                  <div
                    onClick={() => handleJump(bm.ref)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500 font-mono">
                      {isNT ? 'NT' : 'OT'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {bm.ref}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                      {bm.updatedAt ? new Date(bm.updatedAt).toLocaleDateString() : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(bm.ref)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors cursor-pointer"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
