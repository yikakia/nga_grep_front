使用 npm 进行包管理

```bash
npm install
```

使用 tailwindcss 编译

[安装](https://tailwindcss.com/docs/installation/tailwind-cli)

```bash
tailwindcss -o output.css
```

开发调试运行
```bash
# 如果改了 theme.js 中的内容 需要重新注入到 index.html 中让他生效
npm run prestart
npm run prebuild

# 开发&预览
npm run dev
# 生产
npm run build
```

_header 文件可能没用？