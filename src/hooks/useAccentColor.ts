import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';

// Preset accent colors (HSL hue values)
export const ACCENT_PRESETS = [
  { name: 'Blue', hue: 217, value: '#1d4ed8' },
  { name: 'Indigo', hue: 245, value: '#4f46e5' },
  { name: 'Violet', hue: 270, value: '#7c3aed' },
  { name: 'Pink', hue: 330, value: '#db2777' },
  { name: 'Rose', hue: 350, value: '#e11d48' },
  { name: 'Red', hue: 0, value: '#dc2626' },
  { name: 'Orange', hue: 25, value: '#ea580c' },
  { name: 'Amber', hue: 38, value: '#d97706' },
  { name: 'Green', hue: 142, value: '#16a34a' },
  { name: 'Teal', hue: 172, value: '#0d9488' },
  { name: 'Cyan', hue: 192, value: '#0891b2' },
  { name: 'Slate', hue: 215, value: '#475569' },
] as const;

function applyAccentHue(hue: number) {
  const root = document.documentElement;
  // Sidebar
  root.style.setProperty('--sidebar-bg-h', `${hue}`);
  root.style.setProperty('--sidebar-bg-s', '33%');
  root.style.setProperty('--sidebar-bg-l', '17%');
  // Accent highlight color used for active states, badges, avatar bg
  root.style.setProperty('--accent-hue', `${hue}`);
}

export function useAccentColor() {
  const { data: profile } = useProfile();

  useEffect(() => {
    const accentColor = profile?.accent_color;
    if (accentColor) {
      const preset = ACCENT_PRESETS.find((p) => p.name === accentColor);
      if (preset) {
        applyAccentHue(preset.hue);
      }
    } else {
      // Default: blue
      applyAccentHue(217);
    }
  }, [profile?.accent_color]);

  return profile?.accent_color || 'Blue';
}
