export class ThemeManager {
    constructor() {
        this.toggleBtn = document.getElementById('toggleDark');
        this.themeIcon = document.getElementById('themeIcon');
        this.init();
    }

    updateThemeIcon(isDark) {
        this.themeIcon.textContent = isDark ? '🌙' : '☀';
        this.themeIcon.title = isDark ? '切换到浅色模式' : '切换到深色模式';
        this.toggleBtn.title = isDark ? '切换到浅色模式' : '切换到深色模式';
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