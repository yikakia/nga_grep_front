(function (global) {
    const STORAGE_KEY = 'theme';
    const DARK = 'dark';
    const LIGHT = 'light';
    const MEDIA_QUERY = '(prefers-color-scheme: dark)';
    const PRELOAD_LOCK_CLASS = 'theme-preload-lock';
    const THEME_ATTR = 'data-theme';
    const READY_ATTR = 'data-theme-ready';
    const PRELOAD_STYLE_ID = 'theme-preload-style';
    const DEFAULT_UNLOCK_TIMEOUT = 1800;

    let unlockTimer = null;
    let isUnlocked = false;

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
        const resolvedTheme = useDark ? DARK : LIGHT;
        const root = document.documentElement;

        root.classList.toggle(DARK, useDark);
        root.setAttribute(THEME_ATTR, resolvedTheme);
        root.style.colorScheme = resolvedTheme;

        return useDark;
    }

    function lockPreload() {
        const root = document.documentElement;
        root.classList.add(PRELOAD_LOCK_CLASS);
        root.setAttribute(READY_ATTR, '0');
    }

    function clearPreloadStyle() {
        const styleEl = document.getElementById(PRELOAD_STYLE_ID);
        if (styleEl && styleEl.parentNode) {
            styleEl.parentNode.removeChild(styleEl);
        }
    }

    function unlockPreload() {
        if (isUnlocked) {
            return;
        }

        isUnlocked = true;
        const root = document.documentElement;
        root.classList.remove(PRELOAD_LOCK_CLASS);
        root.setAttribute(READY_ATTR, '1');
        clearPreloadStyle();

        if (unlockTimer) {
            global.clearTimeout(unlockTimer);
            unlockTimer = null;
        }
    }

    function unlockWhenReady(options = {}) {
        const force = Boolean(options.force);
        const canUnlock = force || document.readyState === 'interactive' || document.readyState === 'complete';

        if (canUnlock) {
            unlockPreload();
            return true;
        }

        if (typeof global.requestAnimationFrame === 'function') {
            global.requestAnimationFrame(() => unlockWhenReady(options));
        } else {
            global.setTimeout(() => unlockWhenReady(options), 16);
        }

        return false;
    }

    function scheduleUnlockFallback(timeout = DEFAULT_UNLOCK_TIMEOUT) {
        if (unlockTimer) {
            global.clearTimeout(unlockTimer);
        }

        unlockTimer = global.setTimeout(() => {
            unlockWhenReady({ force: true });
        }, timeout);
    }

    function installUnlockHooks() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => unlockWhenReady(), { once: true });
            global.addEventListener('load', () => unlockWhenReady({ force: true }), { once: true });
            return;
        }

        unlockWhenReady();
    }

    function applyInitialTheme() {
        lockPreload();
        const isDark = applyTheme(resolveTheme());
        scheduleUnlockFallback();
        installUnlockHooks();
        return isDark;
    }

    global.__themeRuntime = {
        STORAGE_KEY,
        DARK,
        LIGHT,
        MEDIA_QUERY,
        PRELOAD_LOCK_CLASS,
        THEME_ATTR,
        READY_ATTR,
        readStoredTheme,
        writeStoredTheme,
        getSystemPreferredTheme,
        resolveTheme,
        applyTheme,
        applyInitialTheme,
        unlockWhenReady
    };
})(window);
