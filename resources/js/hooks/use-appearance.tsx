import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light';
export type Appearance = 'light';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem('appearance', 'light');
    document.cookie = 'appearance=light;path=/;max-age=31536000;SameSite=Lax';
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = 'light';
    const resolvedAppearance: ResolvedAppearance = 'light';
    const updateAppearance = (): void => {};

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
