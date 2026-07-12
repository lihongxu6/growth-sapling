/**
 * 微信小程序编译验证脚本
 *
 * 用法：
 *   node scripts/build.js preview   # 生成预览二维码
 *   node scripts/build.js upload    # 上传代码（需 IP 白名单）
 *   node scripts/build.js compile   # 仅编译验证
 */

const path = require('path');
const fs = require('fs');

// 优先使用本地依赖，回退到全局
let ci;
try {
  ci = require('miniprogram-ci');
} catch {
  ci = require('/root/.nvm/versions/node/v22.13.1/lib/node_modules/miniprogram-ci');
}

// 加载 .private/credentials.env
const envPath = path.join(__dirname, '..', '.private', 'credentials.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
});

const APPID = env.WX_APPID;
// private.key 文件路径（用户从微信后台下载后放到 .private/ 目录）
const PRIVATE_KEY = path.join(__dirname, '..', '.private', 'private.key');
const PROJECT_PATH = path.join(__dirname, '..', 'miniprogram');

const action = process.argv[2] || 'compile';

const project = new ci.Project({
  appid: APPID,
  type: 'miniProgram',
  projectPath: PROJECT_PATH,
  privateKeyPath: PRIVATE_KEY,
  ignores: ['node_modules/**'],
});

(async () => {
  try {
    if (action === 'compile') {
      console.log('🔨 编译中...');
      const result = await ci.compile(project, {
        jsMinify: false,
        es6: true,
        codeProtect: false,
      });
      console.log('✅ 编译成功！包大小:', (result.size / 1024).toFixed(2), 'KB');
    } else if (action === 'preview') {
      console.log('🔨 生成预览二维码中...');
      const qrPath = path.join(__dirname, '..', '.preview-qr.png');
      const result = await ci.preview({
        project,
        desc: '本地预览 - ' + new Date().toLocaleString('zh-CN'),
        setting: { es6: true },
        qrcodeFormat: 'image',
        qrcodeOutputDest: qrPath,
      });
      console.log('✅ 预览二维码已生成:', JSON.stringify(result.subPackageInfo));
      console.log('📁 文件路径: .preview-qr.png');
    } else if (action === 'upload') {
      console.log('🔨 上传代码中...');
      const result = await ci.upload({
        project,
        version: '1.0.0',
        desc: '本地上传 - ' + new Date().toLocaleString('zh-CN'),
        setting: { es6: true },
      });
      console.log('✅ 上传成功！');
    } else {
      console.error('未知操作:', action);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ 失败:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
