(function (global) {
    const STORAGE_KEY = 'theme';
    const DARK = 'dark';
    const LIGHT = 'light';
    const MEDIA_QUERY = '(prefers-color-scheme: dark)';

    function readStoredTheme() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEY);
            return value === DARK || value === LIGHT ? value : null;
        } catch (err) {
            return null;
        }
    }

    function writeStoredTheme(theme) {
        try {
            sessionStorage.setItem(STORAGE_KEY, theme);
        } catch (err) {
            // ignore write failures (e.g. private mode restrictions)
        }
    }

    function getSystemPreferredTheme() {
        return global.matchMedia && global.matchMedia(MEDIA_QUERY).matches ? DARK : LIGHT;
    }

    function resolveTheme() {
        return readStoredTheme() || getSystemPreferredTheme();
    }

    function applyTheme(theme) {
        const useDark = theme === DARK;
        const root = document.documentElement;
        root.classList.toggle(DARK, useDark);
        root.style.colorScheme = useDark ? DARK : LIGHT;
        return useDark;
    }

    function applyInitialTheme() {
        return applyTheme(resolveTheme());
    }

    global.__themeRuntime = {
        STORAGE_KEY,
        DARK,
        LIGHT,
        MEDIA_QUERY,
        readStoredTheme,
        writeStoredTheme,
        getSystemPreferredTheme,
        resolveTheme,
        applyTheme,
        applyInitialTheme
    };
})(window);
