/**
 * 小程序对版检查脚本
 *
 * 扫描 miniprogram/ 下的所有 WXSS/JS/WXML，对照 design-spec 找出：
 * 1. 硬编码颜色（应该用 var(--token)）
 * 2. 硬编码字号（应该用 var(--fs-*)）
 * 3. 硬编码圆角（应该用 var(--radius-*)）
 * 4. 缺失的页面三件套（WXML/WXSS/JS）
 * 5. app.json 中未注册的页面
 * 6. 引用但未定义的 CSS 变量
 * 7. WXML 中 {{}} 引用但 JS data 中未声明的字段
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'miniprogram');

// Design Token 来自 design-spec §2
const DESIGN_TOKENS = {
  colors: ['green', 'green-light', 'green-dark', 'yellow', 'yellow-light',
           'blue', 'blue-light', 'bg', 'card-bg', 'text', 'text-secondary',
           'text-light', 'border', 'orange-tag', 'orange-text', 'danger',
           'danger-light', 'gold'],
  fontSizes: ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl'],
  spacings: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
  radii: ['sm', 'md', 'lg', 'pill'],
  shadows: ['card', 'float'],
};

// 硬编码颜色正则（应替换为 var(--xxx)）
const HARDCODED_COLOR_RE = /(?:background(-color)?|color|border-color)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
const HARDCODED_FONT_SIZE_RE = /font-size\s*:\s*(\d+)rpx/g;
const HARDCODED_RADIUS_RE = /border-radius\s*:\s*(\d+)rpx/g;

let issues = [];

function walk(dir, ext) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) files.push(...walk(p, ext));
    else if (p.endsWith(ext)) files.push(p);
  }
  return files;
}

// 检查 1：硬编码颜色
function checkHardcodedColors() {
  const files = walk(ROOT, '.wxss');
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf-8');
    let m;
    const lines = content.split('\n');
    HARDCODED_COLOR_RE.lastIndex = 0;
    while ((m = HARDCODED_COLOR_RE.exec(content)) !== null) {
      const lineNum = content.substring(0, m.index).split('\n').length;
      const color = m[2].toUpperCase();
      // 忽略 #FFF / #000（这些是设计白和黑）
      if (color === '#FFF' || color === '#FFFFFF' || color === '#000' || color === '#000000') continue;
      issues.push({
        level: 'warning',
        file: path.relative(ROOT, f),
        line: lineNum,
        msg: `硬编码颜色 ${m[2]}（应使用 var(--green/yellow/bg 等)）`,
      });
    }
  }
}

// 检查 2：硬编码字号 < 24rpx（设计规范要求儿童可读下限）
function checkHardcodedFontSizes() {
  const files = walk(ROOT, '.wxss');
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf-8');
    HARDCODED_FONT_SIZE_RE.lastIndex = 0;
    let m;
    while ((m = HARDCODED_FONT_SIZE_RE.exec(content)) !== null) {
      const size = parseInt(m[1]);
      // 装饰性元素（箭头、点）允许小字号
      const lineNum = content.substring(0, m.index).split('\n').length;
      const line = content.split('\n')[lineNum - 1] || '';
      const isDecorative = /arrow|dot|mark|tag|badge|icon|emoji/i.test(line);
      if (size < 24 && !isDecorative) {
        issues.push({
          level: 'error',
          file: path.relative(ROOT, f),
          line: lineNum,
          msg: `字号 ${size}rpx 低于 24rpx 下限（设计规范 §2.2 儿童可读下限）`,
        });
      } else if (size < 20) {
        issues.push({
          level: 'info',
          file: path.relative(ROOT, f),
          line: lineNum,
          msg: `字号 ${size}rpx 偏小，确认是否是装饰性元素`,
        });
      }
    }
  }
}

// 检查 3：硬编码圆角（应该用 var(--radius-*)）
function checkHardcodedRadius() {
  const files = walk(ROOT, '.wxss');
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf-8');
    HARDCODED_RADIUS_RE.lastIndex = 0;
    let m;
    while ((m = HARDCODED_RADIUS_RE.exec(content)) !== null) {
      const r = parseInt(m[1]);
      const lineNum = content.substring(0, m.index).split('\n').length;
      issues.push({
        level: 'info',
        file: path.relative(ROOT, f),
        line: lineNum,
        msg: `硬编码圆角 ${r}rpx（建议使用 var(--radius-sm/md/lg/pill)）`,
      });
    }
  }
}

// 检查 4：app.json 注册页面 vs 实际页面文件
function checkPageRegistration() {
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf-8'));
  const registered = new Set(appJson.pages || []);

  const pagesDir = path.join(ROOT, 'pages');
  const actualPages = [];
  for (const p of fs.readdirSync(pagesDir)) {
    const sub = path.join(pagesDir, p);
    if (fs.statSync(sub).isDirectory()) {
      actualPages.push(`pages/${p}/${p}`);
    }
  }

  for (const p of actualPages) {
    if (!registered.has(p)) {
      issues.push({
        level: 'error',
        file: 'app.json',
        line: 0,
        msg: `页面 ${p} 存在但未在 app.json 中注册`,
      });
    }
  }
  for (const p of registered) {
    if (!p.startsWith('pages/')) continue;
    if (!actualPages.includes(p)) {
      issues.push({
        level: 'error',
        file: 'app.json',
        line: 0,
        msg: `app.json 注册了 ${p} 但实际文件不存在`,
      });
    }
  }
}

// 检查 5：页面三件套完整性
function checkPageTriplet() {
  const pagesDir = path.join(ROOT, 'pages');
  for (const p of fs.readdirSync(pagesDir)) {
    const sub = path.join(pagesDir, p);
    if (!fs.statSync(sub).isDirectory()) continue;
    const files = fs.readdirSync(sub);
    const required = [`${p}.wxml`, `${p}.wxss`, `${p}.js`];
    for (const req of required) {
      if (!files.includes(req)) {
        issues.push({
          level: 'error',
          file: `pages/${p}/`,
          line: 0,
          msg: `缺少文件 ${req}（页面三件套不完整）`,
        });
      }
    }
  }
}

// 检查 6：WXML 中 {{}} 引用是否在 data 中声明
function checkDataBinding() {
  const pagesDir = path.join(ROOT, 'pages');
  for (const p of fs.readdirSync(pagesDir)) {
    const sub = path.join(pagesDir, p);
    if (!fs.statSync(sub).isDirectory()) continue;

    const wxmlPath = path.join(sub, `${p}.wxml`);
    const jsPath = path.join(sub, `${p}.js`);
    if (!fs.existsSync(wxmlPath) || !fs.existsSync(jsPath)) continue;

    const wxml = fs.readFileSync(wxmlPath, 'utf-8');
    let jsContent;
    try {
      jsContent = fs.readFileSync(jsPath, 'utf-8');
    } catch (e) { continue; }

    // 提取 WXML 中 {{var}} 引用
    const refs = new Set();
    const re = /\{\{\s*([a-zA-Z_][\w\.]*)/g;
    let m;
    while ((m = re.exec(wxml)) !== null) {
      const name = m[1].split('.')[0]; // 忽略 a.b.c 的细节
      // 忽略方法调用
      if (m[1].includes('(')) continue;
      refs.add(name);
    }

    // 提取 JS data 中声明的字段
    const declared = new Set();
    const dataRe = /data\s*:\s*\{([\s\S]*?)\n\s*\}/;
    const dataMatch = jsContent.match(dataRe);
    if (dataMatch) {
      const lines = dataMatch[1].split(',');
      for (const line of lines) {
        const key = line.trim().split(':')[0].trim();
        if (key) declared.add(key);
      }
    }

    for (const ref of refs) {
      if (!declared.has(ref) && !['item', 'index', 'wx', 'app'].includes(ref)) {
        issues.push({
          level: 'warning',
          file: `pages/${p}/${p}.wxml`,
          line: 0,
          msg: `WXML 引用 {{${ref}}} 但 JS data 中未声明（可能 data 没传，也可能是函数调用）`,
        });
      }
    }
  }
}

// 检查 7：CSS 变量使用但未定义
function checkUndefinedCssVars() {
  const files = walk(ROOT, '.wxss');
  const defined = new Set();

  // 从 app.wxss 提取已定义的变量
  const appWxss = fs.readFileSync(path.join(ROOT, 'app.wxss'), 'utf-8');
  const defineRe = /--([a-z0-9-]+)\s*:/g;
  let m;
  while ((m = defineRe.exec(appWxss)) !== null) {
    defined.add(m[1]);
  }

  // 检查所有 WXSS 中使用的变量
  const useRe = /var\(--([a-z0-9-]+)/g;
  for (const f of files) {
    if (f === path.join(ROOT, 'app.wxss')) continue;
    const content = fs.readFileSync(f, 'utf-8');
    while ((m = useRe.exec(content)) !== null) {
      if (!defined.has(m[1])) {
        issues.push({
          level: 'error',
          file: path.relative(ROOT, f),
          line: content.substring(0, m.index).split('\n').length,
          msg: `使用了 var(--${m[1]}) 但 app.wxss 中未定义`,
        });
      }
    }
  }
}

// 执行所有检查
checkHardcodedColors();
checkHardcodedFontSizes();
checkHardcodedRadius();
checkPageRegistration();
checkPageTriplet();
checkDataBinding();
checkUndefinedCssVars();

// 输出报告
const errors = issues.filter(i => i.level === 'error');
const warnings = issues.filter(i => i.level === 'warning');
const infos = issues.filter(i => i.level === 'info');

console.log('\n=== 小程序对版检查报告 ===\n');
console.log(`❌ 错误：${errors.length}`);
console.log(`⚠️  警告：${warnings.length}`);
console.log(`ℹ️  提示：${infos.length}\n`);

function printIssues(list, label) {
  if (list.length === 0) return;
  console.log(`--- ${label} ---`);
  for (const i of list) {
    const loc = i.line > 0 ? `:${i.line}` : '';
    console.log(`  ${i.file}${loc}  ${i.msg}`);
  }
  console.log('');
}

printIssues(errors, '❌ 错误（必须修复）');
printIssues(warnings, '⚠️ 警告（建议修复）');
printIssues(infos, 'ℹ️ 提示（可选优化）');

// 退出码：error 时为 1
process.exit(errors.length > 0 ? 1 : 0);
