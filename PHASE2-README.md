# Phase 2 内容深度扩展 - 项目结构

## 概述

Phase 2将知识图谱系统从75个节点扩展到150个节点，新增75个高级数学概念节点，深化Skills模块内容，并完善100个行业应用案例。

## 项目结构

```
knowledge-graph/
├── data/                                    # 数据文件目录
│   ├── nodes-extended-phase2.json          # Phase 2新增的75个节点
│   ├── edges-extended-phase2.json          # Phase 2新增的边关系
│   ├── applications-extended-phase2.json   # Phase 2新增的100个应用案例
│   ├── skills-content-phase2.json          # Phase 2 Skills深度内容
│   ├── metadata-phase2.json                # Phase 2元数据
│   ├── nodes-extended-phase1.json          # Phase 1节点（已存在）
│   └── edges-extended-phase1.json          # Phase 1边关系（已存在）
│
├── scripts/                                 # 脚本目录
│   ├── generate-phase2-data.js             # 数据生成脚本
│   ├── validate-phase2-data.js             # 数据验证脚本
│   ├── content-generator.js                # ContentGenerator类
│   └── data-validator.js                   # DataValidator类
│
├── js/                                      # JavaScript源代码
│   ├── components/                          # UI组件
│   ├── modules/                             # 核心模块
│   └── skills/                              # Skills系统
│
├── styles/                                  # 样式文件
│   ├── main.css
│   └── skills.css
│
├── .kiro/specs/phase2-content-expansion/   # 规格文档
│   ├── requirements.md                      # 需求文档
│   ├── design.md                            # 设计文档
│   ├── tasks.md                             # 任务列表
│   └── .config.kiro                         # 配置文件
│
├── package.json                             # npm配置文件
├── index.html                               # 主页面
└── PHASE2-README.md                         # 本文件

```

## 数据文件说明

### nodes-extended-phase2.json
包含Phase 2新增的75个高级节点：
- domain-1: 20个节点（曲率、函数作图、不等式证明、泰勒展开应用）
- domain-2: 24个节点（曲线积分、曲面积分、场论、偏微分方程、级数应用）
- domain-3: 18个节点（向量分析、张量、变分法、最优控制、数值优化）
- domain-4: 10个节点（概率论基础、随机变量、常见分布、数理统计、随机过程）
- domain-5: 3个节点（人工智能、金融工程、物理建模、工程应用、数据科学）

### edges-extended-phase2.json
包含Phase 2的边关系：
- prerequisite: 前置关系边
- cross-domain: 跨域关系边
- application: 应用关系边

### applications-extended-phase2.json
包含100个详细的应用案例，覆盖15个以上行业领域。

### skills-content-phase2.json
包含Skills模块的深度内容：
- 高级主题
- 进阶练习题（每个Skill至少10道）
- 项目实战（每个Skill至少2个）

### metadata-phase2.json
记录Phase 2项目的元数据和统计信息。

## npm脚本命令

### 数据生成和验证
```bash
# 生成Phase 2数据
npm run generate:phase2

# 验证Phase 2数据
npm run validate:phase2
```

### 测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行属性测试
npm run test:property

# 运行集成测试
npm run test:integration

# 生成测试覆盖率报告
npm run test:coverage
```

### 开发和部署
```bash
# 开发模式（使用Live Server或类似工具）
npm run dev

# 构建生产版本
npm run build

# 部署到服务器
npm run deploy
```

### 实用工具
```bash
# 检查数据文件
npm run check:data

# 集成Phase 1数据
npm run integrate:phase1

# 验证Phase 1集成
npm run verify:phase1
```

## 开发流程

### 1. 搭建基础架构（Task 1）✅
- 创建数据目录结构
- 创建空数据文件
- 配置package.json

### 2. 实现核心工具（Task 2-4）
- ContentGenerator: 内容生成器
- DataValidator: 数据验证器
- DataParser/Serializer: 数据解析和序列化

### 3. 生成数据（Task 5-9）
- 按domain逐步生成节点
- 生成边关系网络
- 生成应用案例
- 生成Skills深度内容

### 4. 系统集成（Task 15-19）
- 实现NodeManager、LearningPathEngine、SearchFilterEngine
- 集成到Knowledge_Graph_System
- 实现可视化增强

### 5. 功能增强（Task 20-22）
- 移动端适配
- 导出与分享功能
- 多语言支持

### 6. 测试和文档（Task 23-27）
- 编写属性测试和单元测试
- 编写用户文档和开发者文档
- 实现交互式新手引导

### 7. 部署（Task 28-31）
- 性能测试与优化
- 集成测试
- 部署到生产环境

## 当前状态

- ✅ Task 1: 搭建Phase 2项目基础架构（已完成）
- ⏳ Task 2: 实现Content_Generator核心功能（待实现）
- ⏳ Task 3: 实现Data_Validator数据验证器（待实现）
- ⏳ 其他任务（待实现）

## 技术栈

- **前端框架**: D3.js (知识图谱可视化), Three.js (3D可视化), Plotly (数据图表)
- **数据格式**: JSON
- **数学公式渲染**: LaTeX/MathJax
- **编程语言**: JavaScript (前端), Node.js (脚本)
- **测试框架**: Jest (单元测试), fast-check (属性测试)

## 质量保证

### 15个核心正确性属性
1. 节点生成数量正确性
2. 节点数据完整性
3. 难度值范围约束
4. 学习时长范围约束
5. 高级节点难度约束
6. 高级节点应用案例数量
7. 应用案例数据完整性
8. 应用案例行业多样性
9. 引用完整性
10. 无循环依赖
11. 边关系类型有效性
12. 数据序列化往返属性
13. JSON格式化一致性
14. 过滤功能正确性
15. 学习路径可达性

### 测试策略
- 单元测试覆盖率 ≥ 80%
- 属性测试覆盖所有15个核心属性
- 集成测试覆盖主要用户流程

## 相关文档

- [需求文档](.kiro/specs/phase2-content-expansion/requirements.md)
- [设计文档](.kiro/specs/phase2-content-expansion/design.md)
- [任务列表](.kiro/specs/phase2-content-expansion/tasks.md)
- [Phase 1完成总结](PHASE1-COMPLETION-SUMMARY.md)

## 联系方式

如有问题或建议，请查看项目文档或联系开发团队。
