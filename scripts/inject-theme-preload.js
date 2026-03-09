const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT_DIR, 'js', 'theme-preload.js');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'index.template.html');
const OUTPUT_PATH = path.join(ROOT_DIR, 'index.html');

const PLACEHOLDER = '<!-- THEME_PRELOAD_INJECT -->';
const PLACEHOLDER_LINE_REGEX = /^[ \t]*<!-- THEME_PRELOAD_INJECT -->/m;
const START_MARKER = '<!-- THEME_PRELOAD:START -->';
const END_MARKER = '<!-- THEME_PRELOAD:END -->';

function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function normalizeEol(text, eol) {
  return text.replace(/\r?\n/g, eol);
}

function indentLines(content, indent, eol) {
  return content
    .split(/\r?\n/)
    .map((line) => `${indent}${line}`)
    .join(eol);
}

function buildInlineBlock(preloadSource, eol) {
  const baseIndent = '    ';
  const runtimeScript = [
    '// AUTO-GENERATED FROM ./js/theme-preload.js. DO NOT EDIT DIRECTLY.',
    normalizeEol(preloadSource.trim(), eol),
    'window.__themeRuntime?.applyInitialTheme();'
  ].join(eol);

  return [
    `${baseIndent}${START_MARKER}`,
    `${baseIndent}<script>`,
    indentLines(runtimeScript, `${baseIndent}    `, eol),
    `${baseIndent}</script>`,
    `${baseIndent}${END_MARKER}`
  ].join(eol);
}

function injectThemePreload() {
  const preloadSource = fs.readFileSync(SOURCE_PATH, 'utf8');
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const eol = detectEol(template);
  const inlineBlock = buildInlineBlock(preloadSource, eol);

  if (!PLACEHOLDER_LINE_REGEX.test(template)) {
    throw new Error(`模板文件缺少占位符: ${PLACEHOLDER}`);
  }

  const nextHtml = template.replace(PLACEHOLDER_LINE_REGEX, inlineBlock);
  const currentHtml = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';

  if (nextHtml !== currentHtml) {
    fs.writeFileSync(OUTPUT_PATH, nextHtml, 'utf8');
    console.log('已根据模板生成主题首屏脚本：index.html');
    return;
  }

  console.log('index.html 无需更新。');
}

injectThemePreload();
