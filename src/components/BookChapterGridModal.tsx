import React, { useState } from 'react';
import { useBible } from '../context/BibleContext';
import { BIBLE_BOOKS } from '../constants/bibleData';
import { X, ArrowLeft } from 'lucide-react';

export const BookChapterGridModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentBook,
    currentChapter,
    goToChapter
  } = useBible();

  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  if (activeModal !== 'grid') {
    return null;
  }

  const handleBookSelect = (book: string) => {
    setSelectedBook(book);
  };

  const handleChapterSelect = (chapterNum: number) => {
    if (selectedBook) {
      goToChapter(selectedBook, chapterNum.toString());
      setSelectedBook(null);
    }
  };

  const getChapterCount = (book: string): number => {
    return (
      BIBLE_BOOKS["Old Testament"][book] ||
      BIBLE_BOOKS["New Testament"][book] ||
      1
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 transition-opacity"
      onClick={() => {
        setActiveModal(null);
        setSelectedBook(null);
      }}
    >
      <div
        className="glass-panel modal-enter w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-black/40">
          <div className="flex items-center gap-2">
            {selectedBook && (
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="p-1 rounded-lg hover:bg-gray-200/60 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                title="Back to books"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {selectedBook ? `${selectedBook} — Select Chapter` : 'Select Book'}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveModal(null);
              setSelectedBook(null);
            }}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {!selectedBook ? (
            /* Books Grid View */
            <div className="space-y-6">
              {/* Old Testament */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3">
                  Old Testament (46 Books)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.keys(BIBLE_BOOKS["Old Testament"]).map((b) => {
                    const isCurrent = b === currentBook;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleBookSelect(b)}
                        className={`p-2.5 rounded-xl font-medium text-xs text-center transition-all cursor-pointer glass-input hover:border-primary/50 ${
                          isCurrent
                            ? 'ring-2 ring-primary text-primary font-bold dark:bg-primary/10'
                            : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* New Testament */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3">
                  New Testament (27 Books)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.keys(BIBLE_BOOKS["New Testament"]).map((b) => {
                    const isCurrent = b === currentBook;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleBookSelect(b)}
                        className={`p-2.5 rounded-xl font-medium text-xs text-center transition-all cursor-pointer glass-input hover:border-primary/50 ${
                          isCurrent
                            ? 'ring-2 ring-primary text-primary font-bold dark:bg-primary/10'
                            : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Chapters Grid View */
            <div>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {Array.from({ length: getChapterCount(selectedBook) }, (_, i) => i + 1).map((chNum) => {
                  const isCurrent =
                    selectedBook === currentBook && chNum.toString() === currentChapter;
                  return (
                    <button
                      key={chNum}
                      type="button"
                      onClick={() => handleChapterSelect(chNum)}
                      className={`py-3 rounded-xl font-bold text-sm text-center transition-all cursor-pointer glass-input hover:border-primary ${
                        isCurrent
                          ? 'btn-primary shadow-sm scale-105'
                          : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {chNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
