export class ThemeManager {
    constructor() {
        this.toggleBtn = document.getElementById('toggleDark');
        this.themeIcon = document.getElementById('themeIcon');
        this.runtime = window.__themeRuntime;

        if (!this.toggleBtn || !this.themeIcon || !this.runtime) {
            return;
        }

        this.themeCycle = [this.runtime.SYSTEM, this.runtime.LIGHT, this.runtime.DARK];
        this.modeLabelMap = {
            [this.runtime.SYSTEM]: '跟随系统',
            [this.runtime.LIGHT]: '浅色模式',
            [this.runtime.DARK]: '深色模式'
        };

        this.init();
    }

    getNextThemeMode(themeMode) {
        const normalizedMode = this.runtime.normalizeStoredTheme(themeMode);
        const currentIndex = this.themeCycle.indexOf(normalizedMode);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % this.themeCycle.length : 0;
        return this.themeCycle[nextIndex];
    }

    getThemeIcon(themeMode) {
        const normalizedMode = this.runtime.normalizeStoredTheme(themeMode);

        if (normalizedMode === this.runtime.SYSTEM) {
            return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path><path d="M12 16v4"></path></svg>';
        }

        if (normalizedMode === this.runtime.DARK) {
            return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3c0 0 0 0 0 0a7 7 0 0 0 9.79 9.79z"></path></svg>';
        }

        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>';
    }

    updateThemeState(themeMode, isDark) {
        const normalizedMode = this.runtime.normalizeStoredTheme(themeMode);
        const currentLabel = normalizedMode === this.runtime.SYSTEM
            ? `${this.modeLabelMap[this.runtime.SYSTEM]}（当前：${isDark ? '深色' : '浅色'}）`
            : this.modeLabelMap[normalizedMode];
        const nextMode = this.getNextThemeMode(normalizedMode);
        const nextLabel = this.modeLabelMap[nextMode];
        const title = `当前：${currentLabel}，点击切换到${nextLabel}`;

        this.themeIcon.innerHTML = this.getThemeIcon(normalizedMode);
        this.toggleBtn.title = title;
        this.toggleBtn.setAttribute('aria-label', title);
    }

    init() {
        this.toggleBtn.addEventListener('click', () => {
            const currentMode = this.runtime.readStoredTheme();
            const nextMode = this.getNextThemeMode(currentMode);
            const isDark = this.runtime.applyTheme(nextMode);
            this.runtime.writeStoredTheme(nextMode);
            this.updateThemeState(nextMode, isDark);
        });

        this.syncThemeState();
        this.setupSystemThemeListener();
        this.runtime.unlockWhenReady?.();
    }

    syncThemeState() {
        const currentMode = this.runtime.readStoredTheme();
        const isDark = this.runtime.applyTheme(currentMode);
        this.updateThemeState(currentMode, isDark);
    }

    setupSystemThemeListener() {
        const mediaQueryList = window.matchMedia(this.runtime.MEDIA_QUERY);
        mediaQueryList.addEventListener('change', () => {
            const savedThemeMode = this.runtime.readStoredTheme();
            if (savedThemeMode === this.runtime.SYSTEM) {
                const isDark = this.runtime.applyTheme(this.runtime.SYSTEM);
                this.updateThemeState(this.runtime.SYSTEM, isDark);
            }
        });
    }
}
