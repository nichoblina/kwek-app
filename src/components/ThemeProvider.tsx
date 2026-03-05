'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        function applyTheme() {
            try {
                const raw = localStorage.getItem('kwek-settings');
                const theme = raw ? JSON.parse(raw).theme ?? 'default' : 'default';
                const html = document.documentElement;
                html.classList.remove('dark', 'pink');
                if (theme !== 'default') html.classList.add(theme);
            } catch {}
        }

        applyTheme();
        window.addEventListener('kwek-settings-changed', applyTheme);
        return () => window.removeEventListener('kwek-settings-changed', applyTheme);
    }, []);

    return <>{children}</>;
}