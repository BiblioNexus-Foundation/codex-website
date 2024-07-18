import { writable } from 'svelte/store';

const THEME_KEY = 'themePreference';

function createThemeStore() {
    const { subscribe, set, update } = writable(false);

    return {
        subscribe,
        toggle: () => update(darkMode => {
            const newMode = !darkMode;
            document.documentElement.classList.toggle('dark', newMode);
            localStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
            return newMode;
        }),
        initialize: () => {
            const storedTheme = localStorage.getItem(THEME_KEY);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialDarkMode = storedTheme === 'dark' || (storedTheme === null && prefersDark);
            set(initialDarkMode);
            document.documentElement.classList.toggle('dark', initialDarkMode);
        }
    };
}

export const themeStore = createThemeStore();