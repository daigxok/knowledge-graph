# Phase 2 快速开始指南

## 项目概述

Phase 2将知识图谱系统从75个节点扩展到150个节点，新增75个高级数学概念节点。

## 快速开始

### 1. 查看项目结构

```bash
# 查看数据文件
ls data/*phase2*

# 查看脚本文件
ls scripts/
```

### 2. 了解当前状态

当前已完成：
- ✅ 数据目录结构创建
- ✅ 空数据文件创建（5个文件）
- ✅ 脚本目录和占位符脚本
- ✅ package.json配置

待实现：
- ⏳ ContentGenerator（Task 2）
- ⏳ DataValidator（Task 3）
- ⏳ 数据生成（Task 5-9）

### 3. 数据文件说明

#### data/nodes-extended-phase2.json
- 目标：75个新节点
- 当前：0个节点
- 分布：domain-1(20), domain-2(24), domain-3(18), domain-4(10), domain-5(3)

#### data/edges-extended-phase2.json
- 目标：边关系网络
- 类型：prerequisite, cross-domain, application

#### data/applications-extended-phase2.json
- 目标：100个应用案例
- 覆盖：15个以上行业

#### data/skills-content-phase2.json
- 目标：Skills深度内容
- 包含：高级主题、练习题、项目实战

#### data/metadata-phase2.json
- 记录项目元数据和统计信息

### 4. npm命令

```bash
# 生成Phase 2数据（Task 2完成后可用）
npm run generate:phase2

# 验证Phase 2数据（Task 3完成后可用）
npm run validate:phase2

# 运行测试（Task 23-24完成后可用）
npm test
npm run test:unit
npm run test:property
npm run test:integration

# 检查现有数据
npm run check:data
```

### 5. 下一步工作

按照tasks.md中的任务顺序：

1. **Task 2**: 实现ContentGenerator核心功能
   - 2.1 创建ContentGenerator类和基础结构
   - 2.2 实现节点生成功能
   - 2.3 实现应用案例生成功能
   - 2.4 实现边关系生成功能
   - 2.5 实现Skills内容生成功能
   - 2.6 实现数据导出功能

2. **Task 3**: 实现DataValidator数据验证器
   - 3.1 创建DataValidator类和验证规则
   - 3.2 实现节点验证功能
   - 3.3 实现边关系验证功能
   - 3.4 实现循环依赖检测
   - 3.5 实现LaTeX公式验证
   - 3.6 实现应用案例验证
   - 3.7 实现验证报告生成

3. **Task 4**: 实现DataParser和DataSerializer
   - 4.1 创建DataParser类
   - 4.2 创建DataSerializer类
   - 4.3 编写往返属性测试

### 6. 文件位置

```
关键文件：
├── data/
│   ├── nodes-extended-phase2.json          ← 节点数据
│   ├── edges-extended-phase2.json          ← 边关系
│   ├── applications-extended-phase2.json   ← 应用案例
│   ├── skills-content-phase2.json          ← Skills内容
│   └── metadata-phase2.json                ← 元数据
│
├── scripts/
│   ├── generate-phase2-data.js             ← 生成脚本
│   ├── validate-phase2-data.js             ← 验证脚本
│   ├── content-generator.js                ← 生成器类
│   └── data-validator.js                   ← 验证器类
│
└── .kiro/specs/phase2-content-expansion/
    ├── requirements.md                      ← 需求文档
    ├── design.md                            ← 设计文档
    └── tasks.md                             ← 任务列表
```

### 7. 开发建议

1. **按顺序执行任务**：后续任务依赖前面任务的输出
2. **迭代验证**：每完成一个domain的节点生成，立即运行验证
3. **测试驱动**：建议先编写测试，再实现功能
4. **查看设计文档**：详细的实现方案在design.md中

### 8. 质量标准

- 节点必须包含所有必需字段
- difficulty值范围：1-5
- estimatedStudyTime范围：30-120分钟
- 高级节点（difficulty≥4）至少2个应用案例
- 无循环依赖
- LaTeX公式语法正确

### 9. 获取帮助

- 查看 [PHASE2-README.md](PHASE2-README.md) 了解完整项目结构
- 查看 [requirements.md](.kiro/specs/phase2-content-expansion/requirements.md) 了解详细需求
- 查看 [design.md](.kiro/specs/phase2-content-expansion/design.md) 了解设计方案
- 查看 [tasks.md](.kiro/specs/phase2-content-expansion/tasks.md) 了解任务列表

## 总结

Task 1已完成，项目基础架构已搭建完毕。现在可以开始Task 2，实现ContentGenerator核心功能。
