## 安装依赖

```bash
npm install
```

## 使用 tailwindcss 编译

[安装](https://tailwindcss.com/docs/installation/tailwind-cli)

```bash
tailwindcss -o output.css
```

## 主题脚本注入机制

- `index.template.html` 是可维护模板文件。
- `index.html` 是最终产物，由脚本自动生成，请不要手改。
- `scripts/inject-theme-preload.js` 会把 `js/theme-preload.js` 内联到模板中的 `<!-- THEME_PRELOAD_INJECT -->` 占位符位置。

可手动执行：

```bash
npm run theme:inject
```

## 开发与构建

- `npm run dev` 前会自动执行 `theme:inject`（通过 `prestart`）。
- `npm run build` 前会自动执行 `theme:inject`（通过 `prebuild`）。

```bash
# 开发
npm run dev

# 生产构建
npm run build
```
