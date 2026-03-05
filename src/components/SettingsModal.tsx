'use client';

import type { Theme } from '@/lib/types';
import { useSettings } from '@/hooks/useSettings';

interface SettingsModalProps {
  onClose: () => void;
}

const THEMES: { value: Theme; label: string; emoji: string }[] = [
  { value: 'default', label: 'Default', emoji: '🟠' },
  { value: 'dark', label: 'Dark', emoji: '🌙' },
  { value: 'pink', label: 'Pink', emoji: '🩷' },
];

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />

      {/* Modal */}
      <div className='relative z-10 bg-card rounded-2xl border-[1.5px] border-border p-6 w-full max-w-sm shadow-xl'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='font-bold text-lg'>Settings</h2>
          <button
            onClick={onClose}
            className='text-muted hover:text-text-primary transition-colors'
          >
            x
          </button>
        </div>

        {/* Theme */}
        <div className='mb-6'>
          <p className='text-sm font-semibold mb-3'>Theme</p>
          <div className='flex gap-2'>
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => updateSettings({ theme: t.value })}
                className={`flex-1 py-2.5 rounded-xl border-[1.5px] text-sm font-semibold transition-all ${
                  settings.theme === t.value
                    ? 'border-text-primary bg-surface'
                    : 'border-border hover:border-muted'
                }`}
              >
                <span>{t.emoji}</span>
                <span className='mx-2'>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Show confidence ratings */}
        <div className='flex items-center justify-between py-4 border-t border-border'>
          <div>
            <p className='text-sm font-semibold'>Confidence ratings</p>
            <p className='text-xs text-muted mt-0.5'>
              Show Easy/Hard buttons on flashcards
            </p>
          </div>
          <button
            onClick={() =>
              updateSettings({ showConfidence: !settings.showConfidence })
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.showConfidence ? 'bg-primary' : 'bg-border'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                settings.showConfidence
                  ? 'left-[calc(100%-1.375rem)]'
                  : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
