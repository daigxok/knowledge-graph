/**
 * 为每个Skill生成至少10道进阶练习题
 */

const fs = require('fs');
const path = require('path');

// 定义每个技能的进阶练习题
const skillExercises = {
  "函数极限与连续Skill": [
    {
      id: "exercise-adv-001",
      difficulty: 4,
      question: "证明：若f在闭区间[a,b]上连续，则f在[a,b]上一致连续。",
      hints: [
        "使用反证法和有限覆盖定理",
        "考虑ε-δ定义中δ的选择"
      ],
      solution: {
        steps: [
          "假设f不一致连续，则存在ε₀>0，对任意δ>0，存在x₁,x₂使得|x₁-x₂|<δ但|f(x₁)-f(x₂)|≥ε₀",
          "取δₙ=1/n，得到序列{xₙ},{yₙ}满足|xₙ-yₙ|<1/n但|f(xₙ)-f(yₙ)|≥ε₀",
          "由Bolzano-Weierstrass定理，{xₙ}有收敛子列xₙₖ→x₀∈[a,b]",
          "由|xₙₖ-yₙₖ|<1/nₖ→0，得yₙₖ→x₀",
          "由f连续，f(xₙₖ)→f(x₀)且f(yₙₖ)→f(x₀)，故|f(xₙₖ)-f(yₙₖ)|→0",
          "这与|f(xₙₖ)-f(yₙₖ)|≥ε₀矛盾"
        ],
        keyPoints: ["有限覆盖定理", "序列收敛", "连续性定义"]
      },
      relatedNodes: ["node-continuity", "node-limit-def"],
      estimatedTime: 30
    },
    {
      id: "exercise-adv-002",
      difficulty: 4,
      question: "证明：若f满足利普希茨条件，则f一致连续。",
      hints: [
        "利用利普希茨条件的定义",
        "直接构造δ与ε的关系"
      ],
      solution: {
        steps: [
          "设f满足利普希茨条件，即存在L>0使得|f(x)-f(y)|≤L|x-y|对所有x,y成立",
          "对任意ε>0，取δ=ε/L",
          "当|x-y|<δ时，有|f(x)-f(y)|≤L|x-y|<L·δ=L·(ε/L)=ε",
          "因此f一致连续"
        ],
        keyPoints: ["利普希茨条件", "一致连续性", "ε-δ论证"]
      },
      relatedNodes: ["node-continuity"],
      estimatedTime: 20
    }
  ]
};

console.log('练习题生成脚本已创建');
