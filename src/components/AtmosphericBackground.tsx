import React from 'react';
import { useBible } from '../context/BibleContext';
import { FULL_THEMES } from '../constants/bibleData';
import { LiveEffectId } from '../types/bible';

export const AtmosphericBackground: React.FC = () => {
  const { settings } = useBible();

  let effect: LiveEffectId = settings.liveEffect;
  if (effect === 'theme_default') {
    const currentTh = FULL_THEMES[settings.activeThemeId];
    effect = (currentTh && currentTh.animated) ? (currentTh.id as LiveEffectId) : 'none';
  }

  if (effect === 'none') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {effect === 'night_sky' && (
        <>
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage: `
                radial-gradient(1.2px 1.2px at 25px 35px, rgba(255,255,255,0.9), transparent),
                radial-gradient(2px 2px at 120px 160px, rgba(255,255,255,1), transparent),
                radial-gradient(1.2px 1.2px at 280px 90px, rgba(147,197,253,0.9), transparent),
                radial-gradient(2.2px 2.2px at 450px 320px, rgba(255,255,255,0.95), transparent),
                radial-gradient(1.2px 1.2px at 640px 190px, rgba(191,219,254,0.85), transparent),
                radial-gradient(2.5px 2.5px at 820px 480px, rgba(255,255,255,1), transparent)
              `,
              backgroundSize: '550px 550px',
              animation: 'nightSkyTwinkle 6s ease-in-out infinite alternate'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle 850px at 75% 25%, rgba(30, 58, 138, 0.22), transparent 70%), radial-gradient(circle 650px at 20% 80%, rgba(59, 130, 246, 0.15), transparent 70%)',
              animation: 'nightSkyDrift 16s ease-in-out infinite alternate'
            }}
          />
        </>
      )}

      {effect === 'neon_blue' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle 800px at 50% 10%, rgba(0, 210, 255, 0.18), transparent 70%), radial-gradient(circle 600px at 85% 85%, rgba(2, 132, 199, 0.14), transparent 70%)',
            animation: 'neonAuraPulse 4.5s ease-in-out infinite alternate'
          }}
        />
      )}

      {effect === 'yellow_halo' && (
        <div
          className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(250, 204, 21, 0.32) 0%, rgba(253, 224, 71, 0.14) 45%, transparent 70%)',
            animation: 'haloAuraBreathe 6s ease-in-out infinite alternate'
          }}
        />
      )}

      {effect === 'golden_age' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle 750px at 50% 25%, rgba(245, 158, 11, 0.20), transparent 70%), radial-gradient(circle 550px at 15% 80%, rgba(217, 119, 6, 0.14), transparent 70%)',
            animation: 'candleAuraGlow 6s ease-in-out infinite alternate'
          }}
        />
      )}

      {effect === 'red_rose' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle 750px at 50% 18%, rgba(244, 63, 94, 0.20), transparent 70%), radial-gradient(circle 600px at 80% 80%, rgba(225, 29, 72, 0.15), transparent 70%)',
            animation: 'roseAuraGlow 5.5s ease-in-out infinite alternate'
          }}
        />
      )}

      {effect === 'eden_sage' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle 800px at 50% 15%, rgba(16, 185, 129, 0.18), transparent 70%), radial-gradient(circle 550px at 20% 85%, rgba(5, 150, 105, 0.12), transparent 70%)',
            animation: 'edenAuraBreathe 7s ease-in-out infinite alternate'
          }}
        />
      )}

      {effect === 'royal_aurora' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle 800px at 50% 12%, rgba(168, 85, 247, 0.22), transparent 70%), radial-gradient(circle 600px at 85% 85%, rgba(147, 51, 234, 0.16), transparent 70%)',
            animation: 'royalAuroraWave 6.5s ease-in-out infinite alternate'
          }}
        />
      )}

      {effect === 'morning_dew' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle 850px at 50% 10%, rgba(254, 240, 138, 0.25), transparent 70%), radial-gradient(circle 600px at 20% 80%, rgba(253, 186, 116, 0.15), transparent 70%)',
            animation: 'morningDewBreathe 8s ease-in-out infinite alternate'
          }}
        />
      )}
    </div>
  );
};
