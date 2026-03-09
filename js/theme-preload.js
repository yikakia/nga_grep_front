(function (global) {
    const STORAGE_KEY = 'theme';
    const SYSTEM = 'system';
    const DARK = 'dark';
    const LIGHT = 'light';
    const MEDIA_QUERY = '(prefers-color-scheme: dark)';
    const PRELOAD_LOCK_CLASS = 'theme-preload-lock';
    const THEME_ATTR = 'data-theme';
    const THEME_MODE_ATTR = 'data-theme-mode';
    const READY_ATTR = 'data-theme-ready';
    const PRELOAD_STYLE_ID = 'theme-preload-style';
    const DEFAULT_UNLOCK_TIMEOUT = 1800;
    const VALID_THEME_MODES = [SYSTEM, LIGHT, DARK];

    let unlockTimer = null;
    let isUnlocked = false;

    function normalizeStoredTheme(value) {
        return VALID_THEME_MODES.includes(value) ? value : SYSTEM;
    }

    function readStoredTheme() {
        try {
            const value = localStorage.getItem(STORAGE_KEY);
            return normalizeStoredTheme(value);
        } catch (err) {
            return SYSTEM;
        }
    }

    function writeStoredTheme(theme) {
        const normalizedTheme = normalizeStoredTheme(theme);

        try {
            localStorage.setItem(STORAGE_KEY, normalizedTheme);
        } catch (err) {
            // ignore write failures (e.g. private mode restrictions)
        }

        return normalizedTheme;
    }

    function getSystemPreferredTheme() {
        return global.matchMedia && global.matchMedia(MEDIA_QUERY).matches ? DARK : LIGHT;
    }

    function resolveTheme(themeMode = readStoredTheme()) {
        const normalizedMode = normalizeStoredTheme(themeMode);
        return normalizedMode === SYSTEM ? getSystemPreferredTheme() : normalizedMode;
    }

    function applyTheme(themeMode = readStoredTheme()) {
        const normalizedMode = normalizeStoredTheme(themeMode);
        const resolvedTheme = resolveTheme(normalizedMode);
        const useDark = resolvedTheme === DARK;
        const root = document.documentElement;

        root.classList.toggle(DARK, useDark);
        root.setAttribute(THEME_ATTR, resolvedTheme);
        root.setAttribute(THEME_MODE_ATTR, normalizedMode);
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
        const isDark = applyTheme(readStoredTheme());
        scheduleUnlockFallback();
        installUnlockHooks();
        return isDark;
    }

    global.__themeRuntime = {
        STORAGE_KEY,
        SYSTEM,
        DARK,
        LIGHT,
        MEDIA_QUERY,
        PRELOAD_LOCK_CLASS,
        THEME_ATTR,
        THEME_MODE_ATTR,
        READY_ATTR,
        normalizeStoredTheme,
        readStoredTheme,
        writeStoredTheme,
        getSystemPreferredTheme,
        resolveTheme,
        applyTheme,
        applyInitialTheme,
        unlockWhenReady
    };
})(window);
