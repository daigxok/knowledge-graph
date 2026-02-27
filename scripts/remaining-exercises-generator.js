/**
 * 为剩余10个技能生成所有练习题
 * 总共需要生成59道练习题
 */

const fs = require('fs');

// 所有剩余技能的练习题数据
const allExercises = {
  "级数收敛Skill": generateSeriesExercises(),
  "定积分应用Skill": generateDefiniteIntegralExercises(),
  "级数分析Skill": generateSeriesAnalysisExercises(),
  "数值分析Skill": generateNumericalAnalysisExercises(),
  "常微分方程Skill": generateODEExercises(),
  "常微分方程求解Skill": generateODESolvingExercises(),
  "推导动画Skill": generateDerivationExercises(),
  "概念可视化Skill": generateVisualizationExercises(),
  "导数与微分Skill": generateDerivativeExercises(),
  "H5P交互Skill": generateH5PExercises()
};

function generateSeriesExercises() {
  return [
    {
      id: "exercise-adv-007",
      difficulty: 4,
      question: "判断级数Σ(n=1 to ∞) n/(n³+1)的收敛性。",
      hints: ["使用比较判别法", "与Σ1/n²比较"],
      solution: {
        steps: [
          "当n→∞时，n/(n³+1) ~ 1/n²",
          "由于Σ1/n²收敛（p级数，p=2>1）",
          "由比较判别法，Σn/(n³+1)收敛"
        ],
        keyPoints: ["比较判别法", "p级数"]
      },
      relatedNodes: ["node-series-convergence"],
      estimatedTime: 20
    },
    {
      id: "exercise-adv-008",
      difficulty: 5,
      question: "判断级数Σ(n=1 to ∞) (-1)ⁿ·n/(n²+1)的收敛性。",
      hints: ["使用莱布尼茨判别法"],
      solution: {
        steps: [
          "设aₙ = n/(n²+1)",
          "lim aₙ = 0 ✓",
          "{aₙ}单调递减",
          "由莱布尼茨判别法，级数收敛"
        ],
        keyPoints: ["莱布尼茨判别法", "交错级数"]
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
          "ρ = lim|aₙ₊₁/aₙ| = lim 1/(n+1) = 0",
          "收敛半径R = 1/ρ = +∞"
        ],
        keyPoints: ["比值判别法", "收敛半径"]
      },
      relatedNodes: ["node-power-series"],
      estimatedTime: 15
    },
    {
      id: "exercise-adv-010",
      difficulty: 5,
      question: "证明：若Σaₙ绝对收敛，则Σaₙ²收敛。",
      hints: ["使用比较判别法"],
      solution: {
        steps: [
          "由Σ|aₙ|收敛，得lim aₙ = 0",
          "存在N，当n>N时，|aₙ|<1",
          "当n>N时，aₙ² < |aₙ|",
          "由比较判别法，Σaₙ²收敛"
        ],
        keyPoints: ["绝对收敛", "比较判别法"]
      },
      relatedNodes: ["node-series-convergence"],
      estimatedTime: 30
    }
  ];
}

function generateDefiniteIntegralExercises() {
  return [
    {
      id: "exercise-adv-006",
      difficulty: 3,
      question: "求由曲线y=x²和y=x围成的图形的面积。",
      hints: ["找交点", "确定积分区间"],
      solution: {
        steps: [
          "求交点：x²=x，得x=0或x=1",
          "面积S = ∫₀¹(x-x²)dx = 1/6"
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
      hints: ["使用旋转体体积公式"],
      solution: {
        steps: [
          "V = π∫₀^π sin²x dx",
          "= (π/2)·π = π²/2"
        ],
        keyPoints: ["旋转体体积"]
      },
      relatedNodes: ["node-definite-integral-app"],
      estimatedTime: 20
    },
    {
      id: "exercise-adv-008",
      difficulty: 4,
      question: "求曲线y=e^x从x=0到x=1的弧长。",
      hints: ["使用弧长公式"],
      solution: {
        steps: [
          "s = ∫₀¹√(1+e^(2x))dx",
          "≈ 2.003（数值解）"
        ],
        keyPoints: ["弧长公式"]
      },
      relatedNodes: ["node-definite-integral-app"],
      estimatedTime: 25
    },
    {
      id: "exercise-adv-009",
      difficulty: 5,
      question: "一物体在力F(x)=x²+1作用下从x=0移动到x=3，求功。",
      hints: ["功的定义W=∫F(x)dx"],
      solution: {
        steps: [
          "W = ∫₀³(x²+1)dx = 12 J"
        ],
        keyPoints: ["定积分应用", "物理应用"]
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
          "联立方程得交点",
          "S = ∫₋₂⁴[(y+4) - y²/2]dy = 18"
        ],
        keyPoints: ["定积分应用", "面积计算"]
      },
      relatedNodes: ["node-definite-integral-app"],
      estimatedTime: 25
    }
  ];
}

// 保存所有练习题到JSON文件
fs.writeFileSync('scripts/all-remaining-exercises.json', JSON.stringify(allExercises, null, 2));
console.log('✓ 已生成所有剩余练习题数据');
console.log('文件: scripts/all-remaining-exercises.json');
