import { BibleVerse } from '../types/bible';

export interface VoiceReaderState {
  isPlaying: boolean;
  isPaused: boolean;
  book: string;
  chapter: string;
  verseIndex: number;
  totalVerses: number;
  currentVerseNumber: string;
  rate: number;
  selectedVoiceName: string;
}

type StateListener = (state: VoiceReaderState) => void;

class VoiceReaderService {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;

  private verses: BibleVerse[] = [];
  private currentBook: string = '';
  private currentChapter: string = '';
  private currentVerseIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;

  private listeners: Set<StateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (!this.selectedVoice && this.voices.length > 0) {
      // Prefer English voice
      const preferred = this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
      this.selectedVoice = preferred || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public setVoice(voiceName: string) {
    const found = this.voices.find(v => v.name === voiceName);
    if (found) {
      this.selectedVoice = found;
      if (this.isPlaying && !this.isPaused) {
        this.speakCurrentVerse();
      }
    }
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.5, Math.min(2.5, newRate));
    this.notify();
    if (this.isPlaying && !this.isPaused) {
      this.speakCurrentVerse();
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): VoiceReaderState {
    const v = this.verses[this.currentVerseIndex];
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      book: this.currentBook,
      chapter: this.currentChapter,
      verseIndex: this.currentVerseIndex,
      totalVerses: this.verses.length,
      currentVerseNumber: v ? v.verse : '1',
      rate: this.rate,
      selectedVoiceName: this.selectedVoice ? this.selectedVoice.name : ''
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach(l => l(s));
  }

  public start(book: string, chapter: string, verses: BibleVerse[], startVerse: number = 1) {
    if (!this.synth) return;
    this.stop();

    this.currentBook = book;
    this.currentChapter = chapter;
    this.verses = verses;

    const idx = verses.findIndex(v => parseInt(v.verse, 10) === startVerse);
    this.currentVerseIndex = idx >= 0 ? idx : 0;
    this.isPlaying = true;
    this.isPaused = false;

    this.notify();
    this.speakCurrentVerse();
  }

  private speakCurrentVerse() {
    if (!this.synth || !this.isPlaying || this.isPaused) return;
    this.synth.cancel();

    if (this.currentVerseIndex >= this.verses.length) {
      this.stop();
      return;
    }

    const verse = this.verses[this.currentVerseIndex];
    if (!verse) {
      this.stop();
      return;
    }

    const text = `Verse ${verse.verse}. ${verse.text}`;
    const utter = new SpeechSynthesisUtterance(text);

    if (this.selectedVoice) utter.voice = this.selectedVoice;
    utter.rate = this.rate;

    utter.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        this.currentVerseIndex++;
        if (this.currentVerseIndex < this.verses.length) {
          this.notify();
          this.speakCurrentVerse();
        } else {
          this.stop();
        }
      }
    };

    utter.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis error:', e);
      }
    };

    this.currentUtterance = utter;
    this.synth.speak(utter);
    this.notify();

    // Scroll active verse into view
    this.highlightAndScrollToVerse();
  }

  private highlightAndScrollToVerse() {
    if (typeof document === 'undefined') return;
    const v = this.verses[this.currentVerseIndex];
    if (!v) return;

    const ref = `${this.currentBook} ${this.currentChapter}:${v.verse}`;
    const el = document.querySelector(`[data-verse-ref="${ref}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  public pause() {
    if (!this.synth || !this.isPlaying) return;
    this.synth.pause();
    this.isPaused = true;
    this.notify();
  }

  public resume() {
    if (!this.synth || !this.isPlaying) return;
    this.synth.resume();
    this.isPaused = false;
    this.notify();
  }

  public togglePlayPause() {
    if (this.isPaused) {
      this.resume();
    } else if (this.isPlaying) {
      this.pause();
    }
  }

  public nextVerse() {
    if (this.currentVerseIndex < this.verses.length - 1) {
      this.currentVerseIndex++;
      this.speakCurrentVerse();
    } else {
      this.stop();
    }
  }

  public previousVerse() {
    if (this.currentVerseIndex > 0) {
      this.currentVerseIndex--;
      this.speakCurrentVerse();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.notify();
  }
}

export const voiceReader = new VoiceReaderService();
