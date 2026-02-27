/**
 * 演示脚本 - 验证Phase 2应用案例数据
 * 
 * 演示如何使用DataValidator验证应用案例数据
 */

const fs = require('fs');
const path = require('path');
const DataValidator = require('./data-validator.js');

console.log('=== Phase 2 应用案例数据验证演示 ===\n');

// 创建验证器实例
const validator = new DataValidator();

// 加载节点数据
console.log('1. 加载节点数据...');
let nodes = [];
try {
  const nodesPath = path.join(__dirname, '../data/nodes-extended-phase2.json');
  if (fs.existsSync(nodesPath)) {
    const nodesData = JSON.parse(fs.readFileSync(nodesPath, 'utf-8'));
    nodes = nodesData.data || nodesData;
    console.log(`   ✓ 加载了 ${nodes.length} 个节点\n`);
  } else {
    console.log('   ⚠ 节点文件不存在，使用测试数据\n');
    nodes = [
      { id: 'node-test-1', name: '测试节点1' },
      { id: 'node-test-2', name: '测试节点2' }
    ];
  }
} catch (error) {
  console.log(`   ⚠ 加载节点数据失败: ${error.message}`);
  console.log('   使用测试数据\n');
  nodes = [
    { id: 'node-test-1', name: '测试节点1' },
    { id: 'node-test-2', name: '测试节点2' }
  ];
}

// 加载应用案例数据
console.log('2. 加载应用案例数据...');
let applications = [];
try {
  const appsPath = path.join(__dirname, '../data/applications-extended-phase2.json');
  if (fs.existsSync(appsPath)) {
    const appsData = JSON.parse(fs.readFileSync(appsPath, 'utf-8'));
    applications = appsData.data || appsData;
    console.log(`   ✓ 加载了 ${applications.length} 个应用案例\n`);
  } else {
    console.log('   ⚠ 应用案例文件不存在，使用示例数据\n');
    applications = [
      {
        id: 'app-demo-001',
        title: '神经网络反向传播算法',
        industry: '人工智能与机器学习',
        difficulty: 4,
        relatedNodes: ['node-test-1', 'node-test-2'],
        description: '反向传播是训练神经网络的核心算法，通过链式法则计算损失函数对每个参数的梯度。',
        mathematicalConcepts: ['复合函数求导', '链式法则', '梯度', '梯度下降'],
        problemStatement: '给定神经网络损失函数 L(W,b)，如何高效计算所有参数的梯度？',
        solution: {
          steps: [
            '前向传播：计算每层的激活值',
            '计算输出层误差',
            '反向传播误差',
            '计算梯度',
            '更新参数'
          ]
        },
        code: {
          language: 'python',
          implementation: `import numpy as np

class NeuralNetwork:
    def __init__(self, layers):
        self.weights = [np.random.randn(y, x) for x, y in zip(layers[:-1], layers[1:])]
        self.biases = [np.random.randn(y, 1) for y in layers[1:]]
    
    def sigmoid(self, z):
        return 1.0 / (1.0 + np.exp(-z))
    
    def forward(self, x):
        activation = x
        for w, b in zip(self.weights, self.biases):
            z = np.dot(w, activation) + b
            activation = self.sigmoid(z)
        return activation`
        },
        visualization: {
          type: 'interactive-network',
          description: '可视化神经网络的前向传播和反向传播过程'
        }
      },
      {
        id: 'app-demo-002',
        title: '期权定价Black-Scholes模型',
        industry: '金融科技',
        difficulty: 5,
        relatedNodes: ['node-test-1'],
        description: 'Black-Scholes模型是期权定价的经典模型，使用偏微分方程描述期权价格的演化。',
        mathematicalConcepts: ['偏微分方程', '随机过程', '伊藤引理'],
        problemStatement: '如何为欧式期权定价？',
        solution: {
          steps: [
            '建立股票价格的随机微分方程',
            '应用伊藤引理',
            '求解Black-Scholes偏微分方程',
            '得到期权定价公式'
          ]
        },
        code: {
          language: 'python',
          implementation: `import numpy as np
from scipy.stats import norm

def black_scholes_call(S, K, T, r, sigma):
    """计算欧式看涨期权价格"""
    d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
    d2 = d1 - sigma*np.sqrt(T)
    call_price = S*norm.cdf(d1) - K*np.exp(-r*T)*norm.cdf(d2)
    return call_price`
        },
        visualization: {
          type: 'surface-plot',
          description: '期权价格随股票价格和时间的变化'
        }
      }
    ];
  }
} catch (error) {
  console.log(`   ⚠ 加载应用案例数据失败: ${error.message}`);
  console.log('   使用示例数据\n');
  applications = [];
}

// 验证应用案例数据
console.log('3. 验证应用案例数据...');
const result = validator.validateApplications(applications, nodes);

console.log(`\n验证结果:`);
console.log(`   状态: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`   错误数: ${result.errors.length}`);
console.log(`   警告数: ${result.warnings.length}`);

// 显示错误详情
if (result.errors.length > 0) {
  console.log('\n错误详情:');
  result.errors.forEach((error, index) => {
    console.log(`\n错误 ${index + 1}:`);
    console.log(`   类型: ${error.type}`);
    console.log(`   消息: ${error.message}`);
    if (error.details.appId) {
      console.log(`   应用案例ID: ${error.details.appId}`);
    }
    if (error.details.field) {
      console.log(`   字段: ${error.details.field}`);
    }
    if (error.details.missingId) {
      console.log(`   缺失ID: ${error.details.missingId}`);
    }
  });
}

// 显示警告详情
if (result.warnings.length > 0) {
  console.log('\n警告详情:');
  result.warnings.forEach((warning, index) => {
    console.log(`\n警告 ${index + 1}:`);
    console.log(`   类型: ${warning.type}`);
    console.log(`   消息: ${warning.message}`);
  });
}

// 统计信息
console.log('\n4. 统计信息:');
if (applications.length > 0) {
  // 统计行业分布
  const industries = {};
  applications.forEach(app => {
    if (app.industry) {
      industries[app.industry] = (industries[app.industry] || 0) + 1;
    }
  });
  
  console.log(`   总应用案例数: ${applications.length}`);
  console.log(`   涉及行业数: ${Object.keys(industries).length}`);
  console.log(`   行业分布:`);
  Object.entries(industries).forEach(([industry, count]) => {
    console.log(`      - ${industry}: ${count}`);
  });
  
  // 统计代码语言
  const languages = {};
  applications.forEach(app => {
    if (app.code && app.code.language) {
      languages[app.code.language] = (languages[app.code.language] || 0) + 1;
    }
  });
  
  console.log(`   代码语言分布:`);
  Object.entries(languages).forEach(([lang, count]) => {
    console.log(`      - ${lang}: ${count}`);
  });
  
  // 统计难度分布
  const difficulties = {};
  applications.forEach(app => {
    if (app.difficulty) {
      difficulties[app.difficulty] = (difficulties[app.difficulty] || 0) + 1;
    }
  });
  
  console.log(`   难度分布:`);
  Object.entries(difficulties).sort((a, b) => a[0] - b[0]).forEach(([diff, count]) => {
    console.log(`      - 难度${diff}: ${count}`);
  });
}

// 生成验证报告
console.log('\n5. 生成验证报告...');
const report = validator.generateReport([result]);
const reportPath = path.join(__dirname, 'application-validation-report.html');
fs.writeFileSync(reportPath, report);
console.log(`   ✓ 报告已保存到: ${reportPath}`);

console.log('\n=== 演示完成 ===');
console.log('\n使用说明:');
console.log('1. 将应用案例数据保存到 data/applications-extended-phase2.json');
console.log('2. 运行此脚本验证数据: node scripts/demo-validate-applications.js');
console.log('3. 查看生成的HTML报告了解详细验证结果');
console.log('4. 根据错误提示修复数据问题');
