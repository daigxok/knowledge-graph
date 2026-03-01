# Bugfix Requirements Document

## Introduction

本文档描述教师备课功能中节点创建错误的修复需求。当教师用户点击"➕"按钮创建新节点时，系统抛出 `this.allNodes.filter is not a function` 错误，导致节点编辑器无法正常打开。

根本原因是 `NodeEditor.js` 中的 `this.allNodes` 可能不是数组类型（可能是对象或undefined），当调用 `.filter()` 方法时失败。此bug影响教师用户的核心备课功能，需要确保数据类型安全并保持现有功能不受影响。

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `this.allNodes` 不是数组类型（是对象或undefined）且调用 `renderPrerequisitesList()` THEN 系统抛出 `this.allNodes.filter is not a function` 错误

1.2 WHEN 教师用户点击"➕"按钮创建新节点且 `nodeDataManager.getAllNodes()` 返回非数组类型 THEN 节点编辑器无法打开

1.3 WHEN `loadPrerequisitesList()` 从 `nodeDataManager.getAllNodes()` 获取非数组数据 THEN 后续的 `.filter()` 操作失败

### Expected Behavior (Correct)

2.1 WHEN `this.allNodes` 不是数组类型 THEN 系统 SHALL 将其转换为空数组或有效数组，确保 `.filter()` 方法可以正常调用

2.2 WHEN 教师用户点击"➕"按钮创建新节点 THEN 系统 SHALL 正常打开节点编辑器模态框，显示前置知识选择器

2.3 WHEN `nodeDataManager.getAllNodes()` 返回非数组类型 THEN 系统 SHALL 进行类型检查和转换，确保 `this.allNodes` 始终是数组类型

2.4 WHEN 没有可用节点时 THEN 系统 SHALL 显示"暂无可用节点"而不是抛出错误

### Unchanged Behavior (Regression Prevention)

3.1 WHEN `this.allNodes` 是有效数组且包含节点数据 THEN 系统 SHALL CONTINUE TO 正确显示前置知识节点列表

3.2 WHEN 教师用户编辑现有节点 THEN 系统 SHALL CONTINUE TO 正常加载和显示节点数据

3.3 WHEN 前置知识选择器过滤节点（排除当前节点） THEN 系统 SHALL CONTINUE TO 正确执行过滤逻辑

3.4 WHEN 节点编辑器的其他功能（保存、取消、验证）被调用 THEN 系统 SHALL CONTINUE TO 正常工作
