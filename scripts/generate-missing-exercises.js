/**
 * 为缺少练习题的技能生成补充内容
 */

const fs = require('fs');

// 读取当前数据
const data = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));

// 为每个技能定义补充的练习题
const supplementaryExercises = {
  "积分技巧Skill": [
    {
      id: "exercise-adv-007",
      difficulty: 4,
      question: "计算∫ x²e^x dx。",
      hints: ["使用两次分部积分", "设u=x²，dv=e^x dx"],
      solution: {
        steps: [
          "第一次分部积分：u=x²，dv=e^x dx，则du=2x dx，v=e^x",
          "∫x²e^x dx = x²e^x - ∫2xe^x dx",
          "第二次分部积分：u=2x，dv=e^x dx，则du=2dx，v=e^x",
          "∫2xe^x dx = 2xe^x - ∫2e^x dx = 2xe^x - 2e^x",
          "因此∫x²e^x dx = x²e^x - 2xe^x + 2e^x + C = e^x(x²-2x+2) + C"
        ],
        keyPoints: ["分部积分", "递推应用"]
      },
      relatedNodes: ["node-integration-methods"],
      estimatedTime: 20
    },
    {
      id: "exercise-adv-008",
      difficulty: 5,
      question: "计算∫ sin³x cos²x dx。",
      hints: ["使用三角恒等式", "sin³x = sin x(1-cos²x)"],
      solution: {
        steps: [
          "sin³x cos²x = sin x(1-cos²x)cos²x = sin x cos²x - sin x cos⁴x",
          "设u=cos x，则du=-sin x dx",
          "∫sin x cos²x dx = -∫u² du = -u³/3 = -cos³x/3",
          "∫sin x cos⁴x dx = -∫u⁴ du = -u⁵/5 = -cos⁵x/5",
          "因此∫sin³x cos²x dx = -cos³x/3 + cos⁵x/5 + C"
        ],
        keyPoints: ["三角恒等式", "换元积分"]
      },
      relatedNodes: ["node-integration-methods"],
      estimatedTime: 25
    },
    {
      id: "exercise-adv-009",
      difficulty: 4,
      question: "计算∫ 1/(x²+4x+5) dx。",
      hints: ["配方法", "转化为arctan型积分"],
      solution: {
        steps: [
          "x²+4x+5 = (x+2)²+1",
          "设u=x+2，则du=dx",
          "∫1/(x²+4x+5)dx = ∫1/((x+2)²+1)dx = ∫1/(u²+1)du",
          "= arctan(u) + C = arctan(x+2) + C"
        ],
        keyPoints: ["配方法", "反三角函数积分"]
      },
      relatedNodes: ["node-integration-methods"],
      estimatedTime: 15
    },
    {
      id: "exercise-adv-010",
      difficulty: 5,
      question: "计算∫ √(1+x²) dx。",
      hints: ["使用三角换元", "设x=tan θ"],
      solution: {
        steps: [
          "设x=tan θ，则dx=sec²θ dθ，√(1+x²)=sec θ",
          "∫√(1+x²)dx = ∫sec θ·sec²θ dθ = ∫sec³θ dθ",
          "使用分部积分：∫sec³θ dθ = (1/2)(sec θ tan θ + ln|sec θ + tan θ|) + C",
          "回代：sec θ=√(1+x²)，tan θ=x",
          "= (1/2)(x√(1+x²) + ln|√(1+x²)+x|) + C"
        ],
        keyPoints: ["三角换元", "分部积分", "回代"]
      },
      relatedNodes: ["node-integration-methods"],
      estimatedTime: 30
    }
  ],
  
  "级数收敛Skill": [
    {
      id: "exercise-adv-007",
      difficulty: 4,
      question: "判断级数Σ(n=1 to ∞) n/(n³+1)的收敛性。",
      hints: ["使用比较判别法", "与Σ1/n²比较"],
      solution: {
        steps: [
          "当n→∞时，n/(n³+1) ~ n/n³ = 1/n²",
          "由于Σ1/n²收敛（p级数，p=2>1）",
          "由比较判别法的极限形式，lim[n/(n³+1)]/(1/n²) = lim n³/(n³+1) = 1",
          "因此Σn/(n³+1)收敛"
        ],
        keyPoints: ["比较判别法", "等价无穷小", "p级数"]
      },
      relatedNodes: ["node-series-convergence"],
      estimatedTime: 20
    },
    {
      id: "exercise-adv-008",
      difficulty: 5,
      question: "判断级数Σ(n=1 to ∞) (-1)ⁿ·n/(n²+1)的收敛性。",
      hints: ["使用莱布尼茨判别法", "检查单调性和极限"],
      solution: {
        steps: [
          "设aₙ = n/(n²+1)",
          "检查lim aₙ = lim n/(n²+1) = 0 ✓",
          "检查单调性：aₙ₊₁/aₙ = [(n+1)/(n+1)²+1]/[n/(n²+1)]",
          "= (n+1)(n²+1)/[n((n+1)²+1)] < 1（当n足够大时）",
          "因此{aₙ}单调递减",
          "由莱布尼茨判别法，级数收敛"
        ],
        keyPoints: ["莱布尼茨判别法", "交错级数", "单调性"]
      },
      relatedNodes: ["node-series-convergence"],
      estimatedTime: 25
    },
    {
      id: "exercise-adv-009",
      difficulty: 4,
      question: "求幂级数Σ(n=0 to ∞) xⁿ/n!的收敛半径。",
      hints: ["使用比值判别法"],
      solution: {
        steps: [
          "设aₙ = 1/n!",
          "ρ = lim|aₙ₊₁/aₙ| = lim|1/(n+1)!|/|1/n!|",
          "= lim 1/(n+1) = 0",
          "收敛半径R = 1/ρ = +∞",
          "因此级数在整个实数轴上收敛"
        ],
        keyPoints: ["比值判别法", "收敛半径", "阶乘"]
      },
      relatedNodes: ["node-power-series"],
      estimatedTime: 15
    },
    {
      id: "exercise-adv-010",
      difficulty: 5,
      question: "证明：若Σaₙ绝对收敛，则Σaₙ²收敛。",
      hints: ["使用比较判别法", "考虑|aₙ|<1的情况"],
      solution: {
        steps: [
          "由Σ|aₙ|收敛，得lim aₙ = 0",
          "因此存在N，当n>N时，|aₙ|<1",
          "当n>N时，aₙ² = |aₙ|² < |aₙ|",
          "由于Σ|aₙ|收敛，由比较判别法，Σaₙ²（n>N）收敛",
          "有限项不影响收敛性，因此Σaₙ²收敛"
        ],
        keyPoints: ["绝对收敛", "比较判别法", "级数性质"]
      },
      relatedNodes: ["node-series-convergence"],
      estimatedTime: 30
    }
  ],
  
  "定积分应用Skill": [
    {
      id: "exercise-adv-006",
      difficulty: 3,
      question: "求由曲线y=x²和y=x围成的图形的面积。",
      hints: ["找交点", "确定积分区间"],
      solution: {
        steps: [
          "求交点：x²=x，得x=0或x=1",
          "在[0,1]上，x≥x²",
          "面积S = ∫₀¹(x-x²)dx",
          "= [x²/2 - x³/3]₀¹",
          "= 1/2 - 1/3 = 1/6"
        ],
        keyPoints: ["定积分应用", "面积计算"]
      },
      relatedNodes: ["node-definite-integral-app"],
      estimatedTime: 15
    },
    {
      id: "exercise-adv-007",
      difficulty: 4,
      question: "求曲线y=sin x（0≤x≤π）绕x轴旋转一周所得旋转体的体积。",
      hints: ["使用旋转体体积公式", "V=π∫y²dx"],
      solution: {
        steps: [
          "V = π∫₀^π sin²x dx",
          "使用降幂公式：sin²x = (1-cos 2x)/2",
          "V = π∫₀^π (1-cos 2x)/2 dx",
          "= (π/2)[x - sin 2x/2]₀^π",
          "= (π/2)·π = π²/2"
        ],
        keyPoints: ["旋转体体积", "三角函数积分"]
      },
      relatedNodes: ["node-definite-integral-app"],
      estimatedTime: 20
    },
    {
      id: "exercise-adv-008",
      difficulty: 4,
      question: "求曲线y=e^x从x=0到x=1的弧长。",
      hints: ["使用弧长公式", "s=∫√(1+y'²)dx"],
      solution: {
        steps: [
          "y'=e^x",
          "s = ∫₀¹√(1+e^(2x))dx",
          "这是一个较复杂的积分，可用数值方法或查表",
          "设u=e^x，则du=e^x dx，当x=0时u=1，x=1时u=e",
          "s = ∫₁^e √(1+u²)/u du",
          "≈ 2.003（数值解）"
        ],
        keyPoints: ["弧长公式", "换元积分"]
      },
      relatedNodes: ["node-definite-integral-app"],
      estimatedTime: 25
    },
    {
      id: "exercise-adv-009",
      difficulty: 5,
      question: "一物体在力F(x)=x²+1（单位：N）作用下沿x轴从x=0移动到x=3（单位：m），求力所做的功。",
      hints: ["功的定义", "W=∫F(x)dx"],
      solution: {
        steps: [
          "W = ∫₀³(x²+1)dx",
          "= [x³/3 + x]₀³",
          "= 27/3 + 3 - 0",
          "= 9 + 3 = 12 J"
        ],
        keyPoints: ["定积分应用", "物理应用", "功的计算"]
      },
      relatedNodes: ["node-definite-integral-app"],
      estimatedTime: 15
    },
    {
      id: "exercise-adv-010",
      difficulty: 4,
      question: "求抛物线y²=2x与直线y=x-4围成的图形的面积。",
      hints: ["求交点", "选择合适的积分变量"],
      solution: {
        steps: [
          "联立方程：y²=2x，y=x-4",
          "得y²=2(y+4)，即y²-2y-8=0",
          "解得y=-2或y=4，对应x=2或x=8",
          "以y为积分变量：S = ∫₋₂⁴[(y+4) - y²/2]dy",
          "= [y²/2 + 4y - y³/6]₋₂⁴",
          "= (8+16-32/3) - (2-8+4/3)",
          "= 24-32/3-(-6+4/3) = 30-36/3 = 18"
        ],
        keyPoints: ["定积分应用", "变量选择", "面积计算"]
      },
      relatedNodes: ["node-definite-integral-app"],
      estimatedTime: 25
    }
  ]
};

console.log('开始补充练习题...\n');

// 补充练习题
let totalAdded = 0;
data.data.forEach(skill => {
  if (supplementaryExercises[skill.skillId]) {
    const toAdd = supplementaryExercises[skill.skillId];
    const before = skill.advancedExercises.length;
    skill.advancedExercises.push(...toAdd);
    const after = skill.advancedExercises.length;
    console.log(`✓ ${skill.skillId}: ${before}道 → ${after}道 (+${after-before})`);
    totalAdded += (after - before);
  }
});

console.log(`\n总共补充了 ${totalAdded} 道练习题`);
console.log('保存到文件...');

// 更新metadata
data.metadata.totalItems = data.data.length;
data.metadata.lastUpdated = new Date().toISOString();

// 保存文件
fs.writeFileSync('data/skills-content-phase2.json', JSON.stringify(data, null, 2));

console.log('✓ 完成！文件已更新。');
