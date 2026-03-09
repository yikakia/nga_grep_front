const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT_DIR, 'js', 'theme-preload.js');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');

const START_MARKER = '<!-- THEME_PRELOAD:START -->';
const END_MARKER = '<!-- THEME_PRELOAD:END -->';

function indentLines(content, spaces = 8) {
  const indent = ' '.repeat(spaces);
  return content
    .split('\n')
    .map((line) => `${indent}${line}`)
    .join('\n');
}

function buildInlineBlock(preloadSource) {
  const runtimeScript = [
    '// AUTO-GENERATED FROM ./js/theme-preload.js. DO NOT EDIT DIRECTLY.',
    preloadSource.trim(),
    'window.__themeRuntime?.applyInitialTheme();'
  ].join('\n');

  return [
    `    ${START_MARKER}`,
    '    <script>',
    indentLines(runtimeScript),
    '    </script>',
    `    ${END_MARKER}`
  ].join('\n');
}

function replaceMarkedBlock(html, inlineBlock) {
  const markerRegex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`);
  if (!markerRegex.test(html)) {
    return null;
  }

  return html.replace(markerRegex, inlineBlock);
}

function replaceLegacyThemePreload(html, inlineBlock) {
  const legacyRegex = /\s*<script\s+src=["']\.\/js\/theme-preload\.js["']><\/script>\s*\n\s*<script>\s*\n\s*window\.__themeRuntime\?\.applyInitialTheme\(\);\s*\n\s*<\/script>/;
  if (!legacyRegex.test(html)) {
    return null;
  }

  return html.replace(legacyRegex, `\n${inlineBlock}`);
}

function injectBeforeStylesheet(html, inlineBlock) {
  const firstStylesheetRegex = /\n\s*<link\s+href=["']\.\/output\.css["']\s+rel=["']stylesheet["']>/;
  if (!firstStylesheetRegex.test(html)) {
    throw new Error('未找到 output.css 的 link 标签，无法自动注入首屏主题脚本。');
  }

  return html.replace(firstStylesheetRegex, `\n${inlineBlock}$&`);
}

function injectThemePreload() {
  const preloadSource = fs.readFileSync(SOURCE_PATH, 'utf8');
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const inlineBlock = buildInlineBlock(preloadSource);

  let nextHtml = replaceMarkedBlock(html, inlineBlock);

  if (!nextHtml) {
    nextHtml = replaceLegacyThemePreload(html, inlineBlock);
  }

  if (!nextHtml) {
    nextHtml = injectBeforeStylesheet(html, inlineBlock);
  }

  if (nextHtml !== html) {
    fs.writeFileSync(HTML_PATH, nextHtml, 'utf8');
    console.log('已完成主题首屏脚本注入：index.html');
    return;
  }

  console.log('index.html 无需更新。');
}

injectThemePreload();
