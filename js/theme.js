export class ThemeManager {
    constructor() {
        this.toggleBtn = document.getElementById('toggleDark');
        this.themeIcon = document.getElementById('themeIcon');
        this.runtime = window.__themeRuntime;

        if (!this.toggleBtn || !this.themeIcon || !this.runtime) {
            return;
        }

        this.init();
    }

    updateThemeIcon(isDark) {
        const nextThemeTitle = isDark ? '切换到浅色模式' : '切换到深色模式';
        this.themeIcon.innerHTML = isDark
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3c0 0 0 0 0 0a7 7 0 0 0 9.79 9.79z"></path></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>';
        this.toggleBtn.title = nextThemeTitle;
        this.toggleBtn.setAttribute('aria-label', nextThemeTitle);
    }

    init() {
        this.toggleBtn.addEventListener('click', () => {
            const currentIsDark = document.documentElement.classList.contains(this.runtime.DARK);
            const nextTheme = currentIsDark ? this.runtime.LIGHT : this.runtime.DARK;
            const isDark = this.runtime.applyTheme(nextTheme);
            this.runtime.writeStoredTheme(nextTheme);
            this.updateThemeIcon(isDark);
        });

        this.applyTheme();
        this.setupSystemThemeListener();
    }

    applyTheme() {
        const theme = this.runtime.resolveTheme();
        const isDark = this.runtime.applyTheme(theme);
        this.updateThemeIcon(isDark);
    }

    setupSystemThemeListener() {
        window.matchMedia(this.runtime.MEDIA_QUERY).addEventListener('change', e => {
            const savedTheme = this.runtime.readStoredTheme();
            if (!savedTheme) {
                const theme = e.matches ? this.runtime.DARK : this.runtime.LIGHT;
                this.runtime.applyTheme(theme);
                this.updateThemeIcon(e.matches);
            }
        });
    }
}