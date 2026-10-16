import React from 'react';
import { useBible } from '../context/BibleContext';
import { Volume2, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

export const ScriptureReader: React.FC = () => {
  const {
    loadedChapters,
    isLoadingChapter,
    chapterError,
    highlights,
    bookmarks,
    goToNextChapter,
    goToPrevChapter,
    setActiveVerseRef,
    setActiveModal,
    startVoiceReading,
    settings
  } = useBible();

  const widthStyle = {
    maxWidth: `calc(850px * (${settings.contentWidth} / 100))`,
    fontFamily: `"${settings.fontFamily}", sans-serif`,
    fontSize: `var(--font-size-base)`,
    lineHeight: `var(--line-height-base)`,
    fontWeight: settings.isBold ? 600 : 400
  };

  const handleVerseClick = (ref: string) => {
    setActiveVerseRef(ref);
    setActiveModal('verseAction');
  };

  if (isLoadingChapter && loadedChapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4 opacity-80" />
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Loading scripture...</p>
      </div>
    );
  }

  if (chapterError) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-red-700 dark:text-red-400 mb-2">Unable to load chapter</h3>
        <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">{chapterError}</p>
      </div>
    );
  }

  return (
    <div
      id="reading-container"
      style={widthStyle}
      className="w-full mx-auto pb-32 pt-20 lg:pt-4 px-4 sm:px-8 transition-all duration-300"
    >
      {loadedChapters.map((chapterData) => {
        const { book, chapter, verses, reference } = chapterData;

        return (
          <article key={`${book}-${chapter}`} className="chapter-wrapper relative pb-12 pt-2">
            {/* Chapter Header */}
            <div className="flex items-center justify-between mt-4 mb-6 pb-2 border-b border-gray-100 dark:border-white/5">
              <h2
                className="chapter-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
                data-book={book}
                data-chapter={chapter}
              >
                {reference}
              </h2>
              <button
                type="button"
                onClick={() => startVoiceReading(1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-secondary text-xs font-semibold text-primary hover:bg-primary/10 transition-all cursor-pointer"
                title="Listen to this chapter"
              >
                <Volume2 className="w-4 h-4 text-primary" />
                <span>Listen</span>
              </button>
            </div>

            {/* Verses Paragraphs */}
            <div className="space-y-1">
              {verses.map((v) => {
                const verseRef = `${book} ${chapter}:${v.verse}`;
                const hl = highlights[verseRef];
                const isHighlighted = hl && !hl.deleted;
                const bm = bookmarks[verseRef];
                const isBookmarked = bm && !bm.deleted;

                let hlClass = '';
                if (isHighlighted) {
                  hlClass = `highlight-${hl.color}`;
                }

                let bmClass = '';
                if (isBookmarked) {
                  bmClass = 'bookmark-visual';
                }

                return (
                  <p
                    key={v.verse}
                    data-verse-ref={verseRef}
                    onClick={() => handleVerseClick(verseRef)}
                    className={`verse-paragraph ${hlClass} ${bmClass} group relative select-text`}
                  >
                    <sup className="verse-num" title="Verse actions">
                      {v.verse}
                    </sup>
                    <span>{v.text}</span>
                  </p>
                );
              })}
            </div>
          </article>
        );
      })}

      {/* Chapter Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200/60 dark:border-white/5">
        <button
          type="button"
          onClick={goToPrevChapter}
          className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 hover:border-primary/40 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Chapter</span>
        </button>

        <button
          type="button"
          onClick={goToNextChapter}
          className="btn-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span>Next Chapter</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
