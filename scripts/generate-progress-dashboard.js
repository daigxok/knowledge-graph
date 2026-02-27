/**
 * 生成项目进度仪表板
 */

const fs = require('fs');

// 读取数据
const skillsData = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));
const nodesPhase2 = JSON.parse(fs.readFileSync('data/nodes-extended-phase2.json', 'utf8'));

// 统计信息
const stats = {
  skills: {
    total: skillsData.data.length,
    withFullExercises: skillsData.data.filter(s => s.advancedExercises.length >= 10).length,
    totalExercises: skillsData.data.reduce((sum, s) => sum + s.advancedExercises.length, 0),
    totalProjects: skillsData.data.reduce((sum, s) => sum + s.projects.length, 0)
  },
  nodes: {
    phase1: 50,
    phase2Current: nodesPhase2.data.length,
    phase2Target: 75,
    total: 150
  },
  tasks: {
    total: 31,
    completed: 4,
    inProgress: 1,
    pending: 26
  }
};

// 计算完成度
const completion = {
  overall: ((stats.tasks.completed / stats.tasks.total) * 100).toFixed(1),
  nodes: ((stats.nodes.phase2Current / stats.nodes.phase2Target) * 100).toFixed(1),
  skills: ((stats.skills.withFullExercises / stats.skills.total) * 100).toFixed(1)
};

// 生成HTML仪表板
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phase 2 项目进度仪表板</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 1.2em;
      opacity: 0.9;
    }
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .card h2 {
      font-size: 1.3em;
      color: #333;
      margin-bottom: 20px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .progress-circle {
      width: 150px;
      height: 150px;
      margin: 20px auto;
      position: relative;
    }
    .progress-circle svg {
      transform: rotate(-90deg);
    }
    .progress-circle circle {
      fill: none;
      stroke-width: 10;
    }
    .progress-circle .bg {
      stroke: #e0e0e0;
    }
    .progress-circle .progress {
      stroke: #667eea;
      stroke-linecap: round;
      transition: stroke-dashoffset 1s ease;
    }
    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .stat-row:last-child {
      border-bottom: none;
    }
    .stat-label {
      color: #666;
      font-weight: 500;
    }
    .stat-value {
      color: #333;
      font-weight: bold;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }
    .status-completed {
      background: #d4edda;
      color: #155724;
    }
    .status-progress {
      background: #fff3cd;
      color: #856404;
    }
    .status-pending {
      background: #f8d7da;
      color: #721c24;
    }
    .task-list {
      margin-top: 15px;
    }
    .task-item {
      padding: 10px;
      margin: 8px 0;
      background: #f8f9fa;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .task-icon {
      font-size: 1.5em;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 40px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Phase 2 项目进度仪表板</h1>
      <p>知识图谱内容深度扩展项目</p>
      <p style="font-size: 0.9em; margin-top: 10px;">更新时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>

    <div class="dashboard">
      <!-- 总体进度 -->
      <div class="card">
        <h2>📈 总体进度</h2>
        <div class="progress-circle">
          <svg width="150" height="150">
            <circle class="bg" cx="75" cy="75" r="65"></circle>
            <circle class="progress" cx="75" cy="75" r="65" 
              stroke-dasharray="${2 * Math.PI * 65}" 
              stroke-dashoffset="${2 * Math.PI * 65 * (1 - completion.overall / 100)}"></circle>
          </svg>
          <div class="progress-text">${completion.overall}%</div>
        </div>
        <div class="stat-row">
          <span class="stat-label">已完成任务</span>
          <span class="stat-value">${stats.tasks.completed} / ${stats.tasks.total}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">进行中</span>
          <span class="stat-value">${stats.tasks.inProgress}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">待开始</span>
          <span class="stat-value">${stats.tasks.pending}</span>
        </div>
      </div>

      <!-- 节点数据 -->
      <div class="card">
        <h2>🎯 节点数据</h2>
        <div class="progress-circle">
          <svg width="150" height="150">
            <circle class="bg" cx="75" cy="75" r="65"></circle>
            <circle class="progress" cx="75" cy="75" r="65" 
              stroke-dasharray="${2 * Math.PI * 65}" 
              stroke-dashoffset="${2 * Math.PI * 65 * (1 - completion.nodes / 100)}"
              style="stroke: #28a745;"></circle>
          </svg>
          <div class="progress-text" style="color: #28a745;">${completion.nodes}%</div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Phase 1 节点</span>
          <span class="stat-value">${stats.nodes.phase1}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Phase 2 当前</span>
          <span class="stat-value">${stats.nodes.phase2Current} / ${stats.nodes.phase2Target}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">总目标</span>
          <span class="stat-value">${stats.nodes.total}</span>
        </div>
      </div>

      <!-- Skills内容 -->
      <div class="card">
        <h2>📚 Skills内容</h2>
        <div class="progress-circle">
          <svg width="150" height="150">
            <circle class="bg" cx="75" cy="75" r="65"></circle>
            <circle class="progress" cx="75" cy="75" r="65" 
              stroke-dasharray="${2 * Math.PI * 65}" 
              stroke-dashoffset="${2 * Math.PI * 65 * (1 - completion.skills / 100)}"
              style="stroke: #ffc107;"></circle>
          </svg>
          <div class="progress-text" style="color: #ffc107;">${completion.skills}%</div>
        </div>
        <div class="stat-row">
          <span class="stat-label">总技能数</span>
          <span class="stat-value">${stats.skills.total}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">完整练习题</span>
          <span class="stat-value">${stats.skills.withFullExercises} / ${stats.skills.total}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">总练习题</span>
          <span class="stat-value">${stats.skills.totalExercises}道</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">总项目</span>
          <span class="stat-value">${stats.skills.totalProjects}个</span>
        </div>
      </div>
    </div>

    <!-- 任务状态 -->
    <div class="card">
      <h2>✅ 最近完成的任务</h2>
      <div class="task-list">
        <div class="task-item">
          <span class="task-icon">✅</span>
          <div style="flex: 1;">
            <strong>任务1: 搭建Phase 2项目基础架构</strong>
            <span class="status-badge status-completed">已完成</span>
          </div>
        </div>
        <div class="task-item">
          <span class="task-icon">✅</span>
          <div style="flex: 1;">
            <strong>任务2: 实现Content_Generator核心功能</strong>
            <span class="status-badge status-completed">已完成</span>
          </div>
        </div>
        <div class="task-item">
          <span class="task-icon">✅</span>
          <div style="flex: 1;">
            <strong>任务3: 实现Data_Validator数据验证器</strong>
            <span class="status-badge status-completed">已完成</span>
          </div>
        </div>
        <div class="task-item">
          <span class="task-icon">🔄</span>
          <div style="flex: 1;">
            <strong>任务4: 实现Data_Parser和Data_Serializer</strong>
            <span class="status-badge status-progress">进行中</span>
          </div>
        </div>
        <div class="task-item">
          <span class="task-icon">✅</span>
          <div style="flex: 1;">
            <strong>为每个Skill添加至少10道进阶练习题</strong>
            <span class="status-badge status-completed">刚完成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 下一步行动 -->
    <div class="card">
      <h2>🎯 下一步行动</h2>
      <div class="task-list">
        <div class="task-item">
          <span class="task-icon">⏳</span>
          <div style="flex: 1;">
            <strong>完成剩余Skills练习题扩展</strong>
            <span class="status-badge status-pending">高优先级</span>
            <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
              为11个技能各添加至少10道进阶练习题
            </div>
          </div>
        </div>
        <div class="task-item">
          <span class="task-icon">⏳</span>
          <div style="flex: 1;">
            <strong>任务5-9: 生成各Domain节点数据</strong>
            <span class="status-badge status-pending">高优先级</span>
            <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
              生成75个新节点（Domain 1-5）
            </div>
          </div>
        </div>
        <div class="task-item">
          <span class="task-icon">⏳</span>
          <div style="flex: 1;">
            <strong>任务11: 生成边关系网络</strong>
            <span class="status-badge status-pending">高优先级</span>
          </div>
        </div>
        <div class="task-item">
          <span class="task-icon">⏳</span>
          <div style="flex: 1;">
            <strong>任务12: 生成100个应用案例</strong>
            <span class="status-badge status-pending">高优先级</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>📝 详细报告请查看 PROJECT-PROGRESS-REPORT.md</p>
      <p style="margin-top: 10px;">🚀 继续加油！</p>
    </div>
  </div>
</body>
</html>`;

// 保存HTML文件
fs.writeFileSync('PROJECT-PROGRESS-DASHBOARD.html', html);

console.log('✓ 进度仪表板已生成: PROJECT-PROGRESS-DASHBOARD.html');
console.log('\n📊 项目统计:');
console.log(`  总体完成度: ${completion.overall}%`);
console.log(`  节点完成度: ${completion.nodes}%`);
console.log(`  Skills完成度: ${completion.skills}%`);
console.log(`\n✅ 已完成任务: ${stats.tasks.completed}/${stats.tasks.total}`);
console.log(`🔄 进行中: ${stats.tasks.inProgress}`);
console.log(`⏳ 待开始: ${stats.tasks.pending}`);
