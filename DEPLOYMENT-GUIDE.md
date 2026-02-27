# Phase 2 知识图谱系统 - 部署指南

**版本**: 2.0.0  
**更新日期**: 2026-02-27  
**部署类型**: 静态网站

---

## 📋 部署概览

本系统是一个纯前端静态网站，无需后端服务器。可以部署到任何支持静态文件托管的平台。

---

## 🚀 快速部署

### 方式1: 本地部署（开发/测试）

```bash
# 1. 确保所有文件完整
node scripts/final-checkpoint.js

# 2. 使用任意HTTP服务器
# 选项A: Python
python -m http.server 8000

# 选项B: Node.js (需要先安装 http-server)
npx http-server -p 8000

# 选项C: PHP
php -S localhost:8000

# 3. 访问
# 打开浏览器访问: http://localhost:8000
```

### 方式2: GitHub Pages（免费托管）

```bash
# 1. 创建 GitHub 仓库
git init
git add .
git commit -m "Phase 2 Knowledge Graph System"

# 2. 推送到 GitHub
git remote add origin https://github.com/你的用户名/knowledge-graph.git
git branch -M main
git push -u origin main

# 3. 在 GitHub 仓库设置中启用 GitHub Pages
# Settings -> Pages -> Source: main branch -> Save

# 4. 访问
# https://你的用户名.github.io/knowledge-graph/
```

### 方式3: Netlify（推荐，免费）

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 部署
netlify deploy --prod

# 4. 按提示操作，选择当前目录作为发布目录
```

### 方式4: Vercel（推荐，免费）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 按提示操作
```

---

## 📦 部署前检查清单

### 必需检查
- [x] ✅ 运行最终检查点: `node scripts/final-checkpoint.js`
- [x] ✅ 运行所有测试: `bash tests/run-all-tests.sh`
- [ ] ⏳ 验证所有数据文件存在
- [ ] ⏳ 检查浏览器兼容性
- [ ] ⏳ 测试移动端显示

### 可选优化
- [ ] 压缩 JavaScript 文件
- [ ] 压缩 CSS 文件
- [ ] 优化图片资源
- [ ] 配置 CDN
- [ ] 设置缓存策略

---

## 🔧 生产环境配置

### 1. 文件结构验证

确保以下关键文件存在：

```
knowledge-graph/
├── index.html                 # 主页面
├── js/
│   ├── main.js               # 主入口
│   ├── modules/              # 所有模块
│   └── i18n/                 # 翻译文件
├── styles/                   # 样式文件
├── css/                      # 额外样式
├── data/                     # 数据文件
│   ├── nodes.json
│   ├── nodes-extended-phase2.json
│   ├── edges-extended-phase2.json
│   ├── applications-extended-phase2.json
│   ├── skills-content-phase2.json
│   └── domains.json
├── docs/                     # 文档
└── tests/                    # 测试文件
```

### 2. 浏览器兼容性

支持的浏览器：
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

### 3. 性能优化建议

#### JavaScript 压缩（可选）
```bash
# 使用 terser 压缩 JS
npm install -g terser

# 压缩主文件
terser js/main.js -o js/main.min.js -c -m

# 压缩所有模块
find js/modules -name "*.js" -exec terser {} -o {}.min.js -c -m \;
```

#### CSS 压缩（可选）
```bash
# 使用 cssnano
npm install -g cssnano-cli

# 压缩 CSS
cssnano styles/main.css styles/main.min.css
```

---

## 🌐 推荐部署平台

### 1. GitHub Pages（免费）

**优点**:
- 完全免费
- 自动 HTTPS
- 与 Git 集成
- 简单易用

**步骤**:
1. 推送代码到 GitHub
2. 在仓库设置中启用 Pages
3. 选择分支和目录
4. 等待部署完成

**访问**: `https://用户名.github.io/仓库名/`

---

### 2. Netlify（推荐）

**优点**:
- 免费额度充足
- 自动 HTTPS
- 持续部署
- 表单处理
- 无服务器函数支持

**步骤**:
1. 注册 Netlify 账号
2. 连接 Git 仓库或拖拽文件夹
3. 配置构建设置（无需构建）
4. 部署

**配置文件** `netlify.toml`:
```toml
[build]
  publish = "."
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 3. Vercel（推荐）

**优点**:
- 免费额度充足
- 极快的 CDN
- 自动 HTTPS
- 持续部署
- 优秀的性能

**步骤**:
1. 注册 Vercel 账号
2. 导入 Git 仓库
3. 配置项目（无需构建）
4. 部署

**配置文件** `vercel.json`:
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

---

### 4. Cloudflare Pages（推荐）

**优点**:
- 完全免费
- 全球 CDN
- 自动 HTTPS
- 无限带宽
- 优秀的性能

**步骤**:
1. 注册 Cloudflare 账号
2. 连接 Git 仓库
3. 配置构建设置（无需构建）
4. 部署

---

## 🔒 安全配置

### 1. HTTPS

所有推荐平台都自动提供 HTTPS，无需额外配置。

### 2. 内容安全策略（CSP）

在 `index.html` 中添加：

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:;">
```

### 3. 其他安全头

如果使用 Netlify，在 `netlify.toml` 中添加：

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 📊 监控和分析

### 1. Google Analytics（可选）

在 `index.html` 的 `<head>` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. 错误监控（可选）

使用 Sentry 进行错误追踪：

```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production'
  });
</script>
```

---

## 🚦 部署流程

### 标准部署流程

```bash
# 1. 最终检查
node scripts/final-checkpoint.js

# 2. 运行测试
bash tests/run-all-tests.sh

# 3. 提交代码
git add .
git commit -m "Ready for deployment"
git push origin main

# 4. 部署到平台
# (根据选择的平台执行相应命令)

# 5. 验证部署
# 访问部署的 URL，测试所有功能

# 6. 监控
# 检查错误日志和性能指标
```

---

## 🧪 部署后验证

### 功能测试清单

访问部署的网站，验证以下功能：

- [ ] 页面正常加载
- [ ] 知识图谱正常显示
- [ ] 节点点击显示详情
- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] 语言切换正常
- [ ] 移动端显示正常
- [ ] 触摸手势正常
- [ ] 导出功能正常
- [ ] 分享功能正常
- [ ] 新手引导正常

### 性能测试

使用以下工具测试性能：

1. **Lighthouse** (Chrome DevTools)
   - 打开 Chrome DevTools
   - 切换到 Lighthouse 标签
   - 运行审计

2. **PageSpeed Insights**
   - 访问: https://pagespeed.web.dev/
   - 输入部署的 URL
   - 查看报告

目标指标：
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

---

## 🔄 持续部署

### GitHub Actions 自动部署

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run tests
        run: |
          npm install
          bash tests/run-all-tests.sh
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

---

## 📱 移动端优化

### PWA 配置（可选）

创建 `manifest.json`:

```json
{
  "name": "高等数学知识图谱",
  "short_name": "数学图谱",
  "description": "Phase 2 知识图谱系统",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

在 `index.html` 中引用：

```html
<link rel="manifest" href="/manifest.json">
```

---

## 🆘 故障排除

### 常见问题

**问题1: 页面空白**
- 检查浏览器控制台错误
- 确认所有文件路径正确
- 验证 JSON 数据文件格式

**问题2: 数据加载失败**
- 检查 data 目录下所有 JSON 文件
- 验证文件权限
- 检查 CORS 设置（本地开发）

**问题3: 移动端显示异常**
- 清除浏览器缓存
- 检查 viewport 设置
- 验证响应式 CSS

**问题4: 性能问题**
- 启用浏览器缓存
- 使用 CDN
- 压缩资源文件

---

## 📞 支持

### 文档
- 用户指南: `docs/USER-GUIDE.md`
- 开发者文档: `docs/DEVELOPER-GUIDE.md`
- FAQ: `docs/FAQ.md`

### 联系方式
- 项目仓库: [GitHub URL]
- 问题反馈: [Issues URL]

---

## ✅ 部署完成检查

部署完成后，确认以下项目：

- [ ] 网站可以正常访问
- [ ] 所有功能正常工作
- [ ] 性能指标达标
- [ ] 移动端显示正常
- [ ] HTTPS 已启用
- [ ] 监控已配置
- [ ] 文档已更新
- [ ] 团队已通知

---

**部署指南版本**: 1.0.0  
**最后更新**: 2026-02-27  
**状态**: 生产就绪

🚀 **祝部署顺利！**

