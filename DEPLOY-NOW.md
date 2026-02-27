# 🚀 立即部署 Phase 2 知识图谱系统

**状态**: ✅ 部署就绪  
**时间**: 5-10分钟  
**难度**: ⭐ 简单

---

## 快速开始

选择以下任一方式，5分钟内完成部署：

### 🌟 方式1: Netlify（推荐）

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 部署
netlify deploy --prod

# 4. 按提示选择当前目录
# 完成！访问提供的 URL
```

---

### ⚡ 方式2: Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 按提示操作
# 完成！访问提供的 URL
```

---

### 🐙 方式3: GitHub Pages（免费）

```bash
# 1. 创建 GitHub 仓库并推送代码
git init
git add .
git commit -m "Phase 2 Knowledge Graph"
git remote add origin https://github.com/你的用户名/knowledge-graph.git
git push -u origin main

# 2. 在 GitHub 仓库设置中:
# Settings -> Pages -> Source: main branch -> Save

# 3. 等待几分钟
# 完成！访问 https://你的用户名.github.io/knowledge-graph/
```

---

### 💻 方式4: 本地测试

```bash
# Python (推荐)
python -m http.server 8000

# 或 Node.js
npx http-server -p 8000

# 或 PHP
php -S localhost:8000

# 访问 http://localhost:8000
```

---

## ✅ 部署后验证

访问部署的网站，检查：

- [ ] 页面正常加载
- [ ] 知识图谱显示
- [ ] 点击节点显示详情
- [ ] 搜索功能正常
- [ ] 语言切换正常
- [ ] 移动端正常

---

## 📚 详细文档

需要更多信息？查看：

- `DEPLOYMENT-GUIDE.md` - 完整部署指南
- `README-PHASE2-STATUS.md` - 项目状态
- `docs/USER-GUIDE.md` - 用户指南

---

## 🆘 遇到问题？

### 常见问题

**Q: 页面空白？**  
A: 检查浏览器控制台错误，确认文件路径正确

**Q: 数据加载失败？**  
A: 确认 data 目录下所有 JSON 文件存在

**Q: 移动端显示异常？**  
A: 清除浏览器缓存，刷新页面

---

## 🎉 完成！

部署完成后，您的 Phase 2 知识图谱系统就可以服务用户了！

**功能亮点**:
- 153个知识节点
- 5种专业可视化
- 完整移动端支持
- 中英文双语
- 智能学习路径

---

**需要帮助？** 查看 `DEPLOYMENT-GUIDE.md` 获取详细说明

🚀 **祝部署顺利！**
