export class ThemeManager {
    constructor() {
        this.toggleBtn = document.getElementById('toggleDark');
        this.themeIcon = document.getElementById('themeIcon');
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
            const isDark = document.documentElement.classList.toggle('dark');
            sessionStorage.setItem('theme', isDark ? 'dark' : 'light');
            this.updateThemeIcon(isDark);
        });

        this.applyTheme();
        this.setupSystemThemeListener();
    }

    applyTheme() {
        const savedTheme = sessionStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const useDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

        document.documentElement.classList.toggle('dark', useDark);
        this.updateThemeIcon(useDark);
    }

    setupSystemThemeListener() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const savedTheme = sessionStorage.getItem('theme');
            if (!savedTheme) {
                document.documentElement.classList.toggle('dark', e.matches);
                this.updateThemeIcon(e.matches);
            }
        });
    }
}