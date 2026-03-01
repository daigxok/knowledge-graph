# 需求文档：教师备课功能

## 介绍

教师备课功能是高等数学学域知识图谱系统的教师侧核心功能，使教师能够通过可视化界面管理知识图谱节点、创建和编辑节点内容，并自动生成结构化教案。该功能扩展现有学生侧系统，为教师提供专门的内容管理和教学设计工具。

## 术语表

- **Knowledge_Graph_System**: 高等数学学域知识图谱系统，包含节点、边和可视化组件
- **Teacher**: 具有教师角色权限的用户，可以编辑节点和生成教案
- **Student**: 具有学生角色权限的用户，只能浏览节点和学习内容
- **Node**: 知识图谱中的知识点节点，包含名称、描述、公式、难度等属性
- **Lesson_Plan**: 教案，基于节点内容自动生成的结构化教学文档
- **Node_Editor**: 节点编辑器，提供表单界面用于创建和修改节点
- **Auth_Module**: 认证模块，管理用户登录和角色权限
- **Graph_Visualizer**: 图谱可视化组件，使用D3.js渲染知识图谱
- **Node_Data_File**: 存储节点数据的JSON文件（nodes-extended-phase2.json）

## 需求

### 需求 1: 教师角色管理

**用户故事:** 作为系统管理员，我希望能够区分教师和学生用户，以便为不同角色提供不同的功能权限。

#### 验收标准

1. THE Auth_Module SHALL 在用户注册时支持选择用户角色（教师或学生）
2. THE Auth_Module SHALL 在用户数据中存储角色信息（role字段）
3. WHEN 用户登录时，THE Auth_Module SHALL 在会话数据中包含用户角色
4. THE Knowledge_Graph_System SHALL 根据用户角色显示或隐藏教师专用功能
5. WHERE 用户角色为教师，THE Knowledge_Graph_System SHALL 在界面中显示"备课模式"入口

### 需求 2: 节点选择与浏览

**用户故事:** 作为教师，我希望能够在知识图谱中点击和浏览节点，以便选择需要编辑或生成教案的知识点。

#### 验收标准

1. WHEN 教师点击图谱中的节点时，THE Graph_Visualizer SHALL 高亮显示该节点
2. WHEN 节点被选中时，THE Knowledge_Graph_System SHALL 在侧边栏显示节点详细信息
3. THE Knowledge_Graph_System SHALL 在节点详情面板中显示"编辑节点"和"生成教案"按钮
4. WHEN 教师点击"编辑节点"按钮时，THE Knowledge_Graph_System SHALL 打开节点编辑器
5. THE Graph_Visualizer SHALL 保持节点选中状态直到教师选择其他节点或关闭详情面板

### 需求 3: 节点创建

**用户故事:** 作为教师，我希望能够创建新的知识点节点，以便扩展知识图谱内容。

#### 验收标准

1. WHERE 用户角色为教师，THE Knowledge_Graph_System SHALL 在界面中显示"添加节点"按钮
2. WHEN 教师点击"添加节点"按钮时，THE Node_Editor SHALL 打开空白节点创建表单
3. THE Node_Editor SHALL 要求教师填写必填字段：name（中文名称）、nameEn（英文名称）、description（描述）、domains（所属领域）
4. THE Node_Editor SHALL 提供可选字段：difficulty（难度1-5）、prerequisites（前置节点ID数组）、formula（LaTeX公式）、keywords（关键词数组）、importance（重要性1-5）、estimatedStudyTime（预计学习时间分钟）
5. WHEN 教师提交创建表单时，THE Node_Editor SHALL 验证所有必填字段已填写
6. IF 必填字段未填写，THEN THE Node_Editor SHALL 显示错误提示并阻止提交
7. WHEN 表单验证通过时，THE Knowledge_Graph_System SHALL 生成唯一节点ID（格式：node-domain-X-{name}-{timestamp}-{index}）
8. THE Knowledge_Graph_System SHALL 将新节点数据添加到Node_Data_File
9. THE Graph_Visualizer SHALL 在图谱中渲染新创建的节点
10. THE Knowledge_Graph_System SHALL 显示创建成功提示消息

### 需求 4: 节点编辑

**用户故事:** 作为教师，我希望能够编辑现有节点的内容，以便更新和完善知识点信息。

#### 验收标准

1. WHEN 教师打开节点编辑器时，THE Node_Editor SHALL 预填充当前节点的所有字段值
2. THE Node_Editor SHALL 允许教师修改以下字段：name、nameEn、description、difficulty、prerequisites、relatedSkills、formula、keywords、importance、estimatedStudyTime
3. THE Node_Editor SHALL 禁止修改节点ID和创建时间戳
4. THE Node_Editor SHALL 提供LaTeX公式预览功能
5. THE Node_Editor SHALL 提供前置节点选择器，显示可选节点列表
6. WHEN 教师提交编辑表单时，THE Node_Editor SHALL 验证所有必填字段已填写
7. WHEN 表单验证通过时，THE Knowledge_Graph_System SHALL 更新Node_Data_File中的节点数据
8. THE Graph_Visualizer SHALL 刷新图谱显示以反映节点更新
9. THE Knowledge_Graph_System SHALL 显示保存成功提示消息
10. IF 节点数据保存失败，THEN THE Knowledge_Graph_System SHALL 显示错误消息并保留编辑器中的数据

### 需求 5: 教案生成

**用户故事:** 作为教师，我希望能够基于节点内容自动生成教案，以便快速准备教学材料。

#### 验收标准

1. WHEN 教师点击"生成教案"按钮时，THE Knowledge_Graph_System SHALL 收集当前节点的所有数据
2. THE Lesson_Plan SHALL 包含以下章节：教学目标、知识点概述、前置知识、核心内容、关键公式、教学重点、预计课时、实际应用、扩展主题
3. THE Lesson_Plan SHALL 使用节点的name作为教案标题
4. THE Lesson_Plan SHALL 使用节点的description作为知识点概述
5. THE Lesson_Plan SHALL 列出prerequisites对应的节点名称作为前置知识
6. THE Lesson_Plan SHALL 包含节点的formula（如果存在）并使用LaTeX渲染
7. THE Lesson_Plan SHALL 使用keywords生成教学重点列表
8. THE Lesson_Plan SHALL 使用estimatedStudyTime计算预计课时（60分钟=1课时）
9. THE Lesson_Plan SHALL 包含realWorldApplications中的实际应用案例
10. THE Lesson_Plan SHALL 包含advancedTopics作为扩展主题
11. THE Knowledge_Graph_System SHALL 在新窗口或模态框中显示生成的教案
12. THE Knowledge_Graph_System SHALL 提供教案导出功能（PDF、Word、Markdown格式）

### 需求 6: 教案模板

**用户故事:** 作为教师，我希望教案具有统一的格式和结构，以便保持教学材料的一致性。

#### 验收标准

1. THE Lesson_Plan SHALL 使用统一的Markdown模板格式
2. THE Lesson_Plan SHALL 在顶部包含元数据：生成日期、节点ID、难度等级、重要性
3. THE Lesson_Plan SHALL 使用标准化的章节标题和层级结构
4. THE Lesson_Plan SHALL 为空字段显示占位符文本（如"待补充"）
5. THE Lesson_Plan SHALL 包含页脚：生成工具信息和版本号
6. THE Knowledge_Graph_System SHALL 支持教师自定义教案模板
7. WHERE 教师提供自定义模板，THE Knowledge_Graph_System SHALL 使用自定义模板生成教案

### 需求 7: 教师界面权限控制

**用户故事:** 作为系统，我需要确保只有教师角色可以访问编辑功能，以便保护知识图谱数据的完整性。

#### 验收标准

1. WHEN 学生用户访问系统时，THE Knowledge_Graph_System SHALL 隐藏所有教师专用按钮和功能
2. WHEN 学生用户尝试直接访问节点编辑器URL时，THE Knowledge_Graph_System SHALL 显示权限错误并重定向到主页
3. WHEN 教师用户访问系统时，THE Knowledge_Graph_System SHALL 在导航栏显示"备课模式"切换开关
4. THE Knowledge_Graph_System SHALL 在备课模式下显示所有编辑功能
5. THE Knowledge_Graph_System SHALL 在浏览模式下隐藏编辑功能（即使是教师用户）
6. THE Knowledge_Graph_System SHALL 在每次数据修改操作前验证用户角色
7. IF 用户角色不是教师，THEN THE Knowledge_Graph_System SHALL 拒绝数据修改请求

### 需求 8: 数据持久化

**用户故事:** 作为教师，我希望我的编辑能够被保存，以便下次访问时看到更新后的内容。

#### 验收标准

1. WHEN 教师创建或编辑节点时，THE Knowledge_Graph_System SHALL 将更新写入Node_Data_File
2. THE Knowledge_Graph_System SHALL 在写入文件前验证JSON格式正确性
3. THE Knowledge_Graph_System SHALL 在数据写入失败时保留原始数据
4. THE Knowledge_Graph_System SHALL 在每次数据修改后创建备份文件（带时间戳）
5. THE Knowledge_Graph_System SHALL 保留最近10个备份文件
6. THE Knowledge_Graph_System SHALL 提供数据恢复功能，允许教师从备份恢复
7. WHEN 多个教师同时编辑时，THE Knowledge_Graph_System SHALL 检测数据冲突
8. IF 检测到数据冲突，THEN THE Knowledge_Graph_System SHALL 提示教师并提供冲突解决选项

### 需求 9: 节点关系管理

**用户故事:** 作为教师，我希望能够管理节点之间的前置关系，以便构建合理的学习路径。

#### 验收标准

1. THE Node_Editor SHALL 提供前置节点选择器，显示所有可用节点
2. THE Node_Editor SHALL 允许教师添加多个前置节点
3. THE Node_Editor SHALL 允许教师移除前置节点
4. THE Node_Editor SHALL 在选择前置节点时显示节点的名称和ID
5. THE Node_Editor SHALL 检测并防止循环依赖（A依赖B，B依赖A）
6. IF 检测到循环依赖，THEN THE Node_Editor SHALL 显示警告并阻止保存
7. THE Graph_Visualizer SHALL 使用箭头显示节点之间的前置关系
8. WHEN 教师选中节点时，THE Graph_Visualizer SHALL 高亮显示其所有前置节点和后续节点

### 需求 10: 教案导出

**用户故事:** 作为教师，我希望能够导出教案为多种格式，以便在不同场景下使用。

#### 验收标准

1. THE Knowledge_Graph_System SHALL 提供"导出教案"按钮
2. THE Knowledge_Graph_System SHALL 支持导出为Markdown格式
3. THE Knowledge_Graph_System SHALL 支持导出为PDF格式（包含LaTeX公式渲染）
4. THE Knowledge_Graph_System SHALL 支持导出为HTML格式（可打印）
5. WHEN 教师点击导出按钮时，THE Knowledge_Graph_System SHALL 显示格式选择对话框
6. WHEN 教师选择格式后，THE Knowledge_Graph_System SHALL 生成文件并触发浏览器下载
7. THE Knowledge_Graph_System SHALL 使用节点名称作为导出文件名（加上时间戳）
8. THE Knowledge_Graph_System SHALL 在导出的文件中保留所有格式和样式

### 需求 11: 批量教案生成

**用户故事:** 作为教师，我希望能够为多个节点批量生成教案，以便快速准备整个章节的教学材料。

#### 验收标准

1. THE Knowledge_Graph_System SHALL 提供节点多选功能
2. WHEN 教师选中多个节点时，THE Knowledge_Graph_System SHALL 显示"批量生成教案"按钮
3. WHEN 教师点击批量生成按钮时，THE Knowledge_Graph_System SHALL 为每个选中节点生成独立教案
4. THE Knowledge_Graph_System SHALL 将所有教案合并为一个文档，按节点顺序排列
5. THE Knowledge_Graph_System SHALL 在合并文档中添加目录
6. THE Knowledge_Graph_System SHALL 在每个教案之间添加分页符
7. THE Knowledge_Graph_System SHALL 支持批量导出为单个PDF或多个Markdown文件
8. THE Knowledge_Graph_System SHALL 显示批量生成进度条

### 需求 12: 教案预览与编辑

**用户故事:** 作为教师，我希望能够在导出前预览和编辑教案，以便根据实际需要调整内容。

#### 验收标准

1. WHEN 教案生成后，THE Knowledge_Graph_System SHALL 在编辑器中显示教案内容
2. THE Knowledge_Graph_System SHALL 提供富文本编辑器用于修改教案
3. THE Knowledge_Graph_System SHALL 支持Markdown语法编辑
4. THE Knowledge_Graph_System SHALL 提供实时预览功能
5. THE Knowledge_Graph_System SHALL 允许教师添加自定义章节
6. THE Knowledge_Graph_System SHALL 允许教师删除或重新排序章节
7. THE Knowledge_Graph_System SHALL 提供"保存为模板"功能
8. WHEN 教师保存教案模板时，THE Knowledge_Graph_System SHALL 将模板存储在用户配置中
9. THE Knowledge_Graph_System SHALL 在下次生成教案时提供模板选择选项

