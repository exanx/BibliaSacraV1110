# Biblia Sacra (React + TypeScript)

A modern, distraction-free Bible reading application built with React, TypeScript, Vite, and Tailwind CSS. Rewritten from the original BBSPWA3 project while preserving all core features and business logic.

## Key Features

- **Scripture Reader**:
  - Full 73-book Catholic Canon (46 Old Testament books, 27 New Testament books)
  - Seamless navigation across books and chapters with chapter jumping and prev/next navigation
  - 4 built-in translations: Douay-Rheims Bible (DRB), Catholic Public Domain Version (CPDV), World English Bible Catholic Edition (WEBC), and King James Version w/ Deuterocanon (KJV/D)
  - Custom user-provided translations support
- **Verse Annotations & Study**:
  - 5 highlight colors (Yellow, Green, Blue, Pink, Purple)
  - Category tags (General, Faith, Prayer, etc.)
  - Personal reflection notes per verse
  - One-tap scripture bookmarks
  - Markdown notes export & import (`.md`)
  - Copy all notes to clipboard
- **Voice Reader (TTS)**:
  - Audio playback with Web Speech API
  - Synchronized real-time verse highlighting and auto-scrolling
  - Playback speeds (0.75x, 1x, 1.25x, 1.5x, 2x)
  - Voice selector support
- **Quote Studio**:
  - Export beautiful shareable quote cards for any scripture passage
  - Inspiration chips with famous verses
  - Aspect ratios: Square (1:1), Story/Reels (9:16), Wide (16:9)
  - Curated typography, colors, and background imagery
  - High-resolution HTML5 canvas rendering and PNG download
- **Dictionary & Wikipedia Lookup**:
  - Instant word lookup via the Free Dictionary API
  - Biblical topic and encyclopedia summaries via Wikipedia REST API
  - Selection floating tooltip for quick in-text word lookup
- **14 Curated Full Themes & Live Atmospheric Effects**:
  - Main: AMOLED Black, Pure White
  - Light: Golden Parchment, Ancient Scroll, Light Rose, Yellow Halo, Soft Light, Eden Sage
  - Dark: Red Rose, Neon Blue, Night Sky, Golden Age, Grey Hound, Royal Amethyst
  - Ambient animated backgrounds: Night Sky, Living Waters, Divine Aureole, Candlelight, Velvet Crimson, Eden Laurel, Royal Aurora, Dawn Radiance
- **Offline & Persistence**:
  - Local IndexedDB storage engine (`SanctaBibliaDB`)
  - Bulk download manager: cache entire 73-book translations to device for 100% offline access
  - Optional Cloud Sync with Firebase Auth (Google / Email) and Firestore

## Tech Stack

- **Framework**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4, Glassmorphism UI
- **Icons**: Lucide React
- **Persistence**: IndexedDB + Firebase
