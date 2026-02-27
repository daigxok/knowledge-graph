#!/usr/bin/env python3
"""
为所有技能补充至少10道进阶练习题
"""

import json
import sys

# 读取数据
with open('data/skills-content-phase2.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 定义所有补充练习题
exercises_to_add = {
    "积分技巧Skill": [
        {
            "id": "exercise-adv-007",
            "difficulty": 4,
            "question": "计算∫ x²e^x dx。",
            "hints": ["使用两次分部积分", "设u=x²，dv=e^x dx"],
            "solution": {
                "steps": [
                    "第一次分部积分：u=x²，dv=e^x dx，则du=2x dx，v=e^x",
                    "∫x²e^x dx = x²e^x - ∫2xe^x dx",
                    "第二次分部积分：u=2x，dv=e^x dx，则du=2dx，v=e^x",
                    "∫2xe^x dx = 2xe^x - ∫2e^x dx = 2xe^x - 2e^x",
                    "因此∫x²e^x dx = e^x(x²-2x+2) + C"
                ],
                "keyPoints": ["分部积分", "递推应用"]
            },
            "relatedNodes": ["node-integration-methods"],
            "estimatedTime": 20
        }
    ]
}

print("开始补充练习题...")
print(f"当前技能数: {len(data['data'])}")

# 统计
total_added = 0
skills_updated = []

for skill in data['data']:
    skill_id = skill['skillId']
    current_count = len(skill['advancedExercises'])
    needed = max(0, 10 - current_count)
    
    if needed > 0:
        print(f"\n{skill_id}:")
        print(f"  当前: {current_count}道, 需要: {needed}道")
        skills_updated.append(skill_id)

print(f"\n需要更新的技能: {len(skills_updated)}")
print("技能列表:", skills_updated)
