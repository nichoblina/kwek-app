'use client';

import type { Settings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kwek-settings';

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
            }
        } catch {
            // Corrupted locaStorage, fall back to defaults
        }
        setHydrated(true);
    }, []);

    function updateSettings(partial: Partial<Settings>) {
        const updated = { ...settings, ...partial };
        setSettings(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('kwek-settings-changed'));
    }

    return { settings, updateSettings, hydrated };
}