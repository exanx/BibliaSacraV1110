import React, { useState, useEffect } from 'react';
import { useBible } from '../context/BibleContext';
import { voiceReader, VoiceReaderState } from '../services/speechSynthesis';
import { resolveTranslation } from '../services/bibleApi';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  ChevronUp
} from 'lucide-react';

export const VoicePlayerBar: React.FC = () => {
  const { settings } = useBible();
  const [state, setState] = useState<VoiceReaderState>(voiceReader.getState());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoiceList, setShowVoiceList] = useState<boolean>(false);

  useEffect(() => {
    const unsub = voiceReader.subscribe((s) => setState(s));
    setVoices(voiceReader.getVoices());
    return () => unsub();
  }, []);

  // Sync active reading CSS highlight on DOM element
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Remove previous active highlights
    document.querySelectorAll('.verse-reading-active').forEach((el) => {
      el.classList.remove('verse-reading-active');
    });

    if (state.isPlaying && state.book && state.chapter) {
      const activeRef = `${state.book} ${state.chapter}:${state.currentVerseNumber}`;
      const targetEl = document.querySelector(`[data-verse-ref="${activeRef}"]`);
      if (targetEl) {
        targetEl.classList.add('verse-reading-active');
      }
    }
  }, [state.isPlaying, state.book, state.chapter, state.currentVerseNumber]);

  if (!state.isPlaying && !state.isPaused) {
    return null;
  }

  const currentTranslation = resolveTranslation(settings.translation, settings.customBibles);
  const progressPct = state.totalVerses > 0
    ? Math.round(((state.verseIndex + 1) / state.totalVerses) * 100)
    : 0;

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const curIdx = speeds.indexOf(state.rate);
    const nextIdx = (curIdx + 1) % speeds.length;
    voiceReader.setRate(speeds[nextIdx]);
  };

  const scrollToActiveVerse = () => {
    const activeRef = `${state.book} ${state.chapter}:${state.currentVerseNumber}`;
    const targetEl = document.querySelector(`[data-verse-ref="${activeRef}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg glass-panel !bg-white/90 dark:!bg-[#121214]/90 rounded-2xl shadow-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Top progress bar */}
      <div className="h-1 bg-gray-200/50 dark:bg-white/5 w-full">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-3.5 flex items-center justify-between gap-3">
        {/* Info Column */}
        <div
          onClick={scrollToActiveVerse}
          className="flex-1 min-w-0 cursor-pointer group"
          title="Click to jump to active verse"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
              {state.book} {state.chapter}:{state.currentVerseNumber}
            </span>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              {state.verseIndex + 1}/{state.totalVerses}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">
            {currentTranslation.name}
          </p>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => voiceReader.previousVerse()}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
            title="Previous verse"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => voiceReader.togglePlayPause()}
            className="p-2.5 rounded-xl btn-primary shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={state.isPaused ? 'Resume' : 'Pause'}
          >
            {state.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>

          <button
            type="button"
            onClick={() => voiceReader.nextVerse()}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
            title="Next verse"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Button */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg text-[10px] font-bold font-mono btn-secondary hover:text-primary transition-colors cursor-pointer"
            title="Change reading speed"
          >
            {state.rate}x
          </button>

          {/* Voice Selector Popover Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVoiceList(!showVoiceList)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              title="Select speech voice"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {showVoiceList && (
              <div className="absolute bottom-10 right-0 w-64 max-h-60 overflow-y-auto glass-panel p-2 rounded-xl shadow-2xl z-50 text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">
                  Select Speech Voice
                </div>
                {voices.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => {
                      voiceReader.setVoice(v.name);
                      setShowVoiceList(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg truncate text-xs transition-colors cursor-pointer ${
                      state.selectedVoiceName === v.name
                        ? 'btn-primary font-bold'
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {v.name} ({v.lang})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stop / Close Button */}
          <button
            type="button"
            onClick={() => voiceReader.stop()}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Stop audio reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
