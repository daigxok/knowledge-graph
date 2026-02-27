/**
 * Exercise System
 * 练习题系统 - 支持多种题型和即时反馈
 */

export class ExerciseSystem {
    constructor(container) {
        this.container = container;
        this.currentExercise = null;
        this.userAnswer = null;
        this.attempts = 0;
        this.score = 0;
        this.totalExercises = 0;
    }

    /**
     * 显示练习题
     * @param {Object} exercise - 练习题对象
     */
    showExercise(exercise) {
        this.currentExercise = exercise;
        this.userAnswer = null;
        this.attempts = 0;

        switch (exercise.type) {
            case 'multiple-choice':
                this.renderMultipleChoice(exercise);
                break;
            case 'calculation':
                this.renderCalculation(exercise);
                break;
            case 'fill-blanks':
                this.renderFillBlanks(exercise);
                break;
            case 'true-false':
                this.renderTrueFalse(exercise);
                break;
            default:
                console.error('Unknown exercise type:', exercise.type);
        }
    }

    /**
     * 渲染选择题
     */
    renderMultipleChoice(exercise) {
        this.container.innerHTML = `
            <div class="exercise-container">
                <div class="exercise-header">
                    <span class="exercise-type">选择题</span>
                    <span class="exercise-difficulty difficulty-${exercise.difficulty}">
                        ${this.getDifficultyLabel(exercise.difficulty)}
                    </span>
                </div>

                <div class="exercise-question">
                    <h3>${exercise.question}</h3>
                </div>

                <div class="exercise-options">
                    ${exercise.options.map((option, index) => `
                        <div class="option-item" data-index="${index}">
                            <input type="radio" name="answer" id="option-${index}" value="${index}">
                            <label for="option-${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>

                <div class="exercise-actions">
                    <button class="btn-submit" id="submitAnswer">提交答案</button>
                    <button class="btn-hint" id="showHint">提示</button>
                </div>

                <div class="exercise-feedback" id="feedback"></div>
            </div>
        `;

        this.attachSubmitHandler();
    }

    /**
     * 渲染计算题
     */
    renderCalculation(exercise) {
        this.container.innerHTML = `
            <div class="exercise-container">
                <div class="exercise-header">
                    <span class="exercise-type">计算题</span>
                    <span class="exercise-difficulty difficulty-${exercise.difficulty}">
                        ${this.getDifficultyLabel(exercise.difficulty)}
                    </span>
                </div>

                <div class="exercise-question">
                    <h3>${exercise.question}</h3>
                </div>

                <div class="exercise-input">
                    <label for="answerInput">你的答案:</label>
                    <input type="text" id="answerInput" placeholder="输入答案">
                </div>

                <div class="exercise-actions">
                    <button class="btn-submit" id="submitAnswer">提交答案</button>
                    <button class="btn-hint" id="showHint">查看步骤</button>
                </div>

                <div class="exercise-feedback" id="feedback"></div>
            </div>
        `;

        this.attachSubmitHandler();
    }

    /**
     * 渲染填空题
     */
    renderFillBlanks(exercise) {
        // 将问题中的 ___ 替换为输入框
        let questionHtml = exercise.question;
        const blanks = exercise.blanks || [];
        
        blanks.forEach((blank, index) => {
            questionHtml = questionHtml.replace('___', 
                `<input type="text" class="blank-input" data-index="${index}" placeholder="填空${index + 1}">`
            );
        });

        this.container.innerHTML = `
            <div class="exercise-container">
                <div class="exercise-header">
                    <span class="exercise-type">填空题</span>
                    <span class="exercise-difficulty difficulty-${exercise.difficulty}">
                        ${this.getDifficultyLabel(exercise.difficulty)}
                    </span>
                </div>

                <div class="exercise-question">
                    <h3>${questionHtml}</h3>
                </div>

                <div class="exercise-actions">
                    <button class="btn-submit" id="submitAnswer">提交答案</button>
                    <button class="btn-hint" id="showHint">提示</button>
                </div>

                <div class="exercise-feedback" id="feedback"></div>
            </div>
        `;

        this.attachSubmitHandler();
    }

    /**
     * 渲染判断题
     */
    renderTrueFalse(exercise) {
        this.container.innerHTML = `
            <div class="exercise-container">
                <div class="exercise-header">
                    <span class="exercise-type">判断题</span>
                    <span class="exercise-difficulty difficulty-${exercise.difficulty}">
                        ${this.getDifficultyLabel(exercise.difficulty)}
                    </span>
                </div>

                <div class="exercise-question">
                    <h3>${exercise.question}</h3>
                </div>

                <div class="exercise-options">
                    <div class="option-item" data-value="true">
                        <input type="radio" name="answer" id="option-true" value="true">
                        <label for="option-true">✓ 正确</label>
                    </div>
                    <div class="option-item" data-value="false">
                        <input type="radio" name="answer" id="option-false" value="false">
                        <label for="option-false">✗ 错误</label>
                    </div>
                </div>

                <div class="exercise-actions">
                    <button class="btn-submit" id="submitAnswer">提交答案</button>
                    <button class="btn-hint" id="showHint">提示</button>
                </div>

                <div class="exercise-feedback" id="feedback"></div>
            </div>
        `;

        this.attachSubmitHandler();
    }

    /**
     * 附加提交处理器
     */
    attachSubmitHandler() {
        const submitBtn = this.container.querySelector('#submitAnswer');
        const hintBtn = this.container.querySelector('#showHint');

        submitBtn?.addEventListener('click', () => {
            this.checkAnswer();
        });

        hintBtn?.addEventListener('click', () => {
            this.showHint();
        });
    }

    /**
     * 检查答案
     */
    checkAnswer() {
        this.attempts++;
        let isCorrect = false;

        switch (this.currentExercise.type) {
            case 'multiple-choice':
                const selected = this.container.querySelector('input[name="answer"]:checked');
                if (selected) {
                    this.userAnswer = parseInt(selected.value);
                    isCorrect = this.userAnswer === this.currentExercise.answer;
                }
                break;

            case 'calculation':
                const input = this.container.querySelector('#answerInput');
                if (input) {
                    this.userAnswer = input.value.trim();
                    isCorrect = this.compareAnswers(this.userAnswer, this.currentExercise.answer);
                }
                break;

            case 'fill-blanks':
                const blanks = this.container.querySelectorAll('.blank-input');
                this.userAnswer = Array.from(blanks).map(b => b.value.trim());
                isCorrect = this.checkFillBlanks(this.userAnswer, this.currentExercise.answers);
                break;

            case 'true-false':
                const tfSelected = this.container.querySelector('input[name="answer"]:checked');
                if (tfSelected) {
                    this.userAnswer = tfSelected.value === 'true';
                    isCorrect = this.userAnswer === this.currentExercise.answer;
                }
                break;
        }

        this.showFeedback(isCorrect);
    }

    /**
     * 比较答案
     */
    compareAnswers(userAnswer, correctAnswer) {
        // 简单的字符串比较，可以扩展为更复杂的数学表达式比较
        return userAnswer.toLowerCase().replace(/\s/g, '') === 
               correctAnswer.toLowerCase().replace(/\s/g, '');
    }

    /**
     * 检查填空题答案
     */
    checkFillBlanks(userAnswers, correctAnswers) {
        if (userAnswers.length !== correctAnswers.length) {
            return false;
        }
        return userAnswers.every((answer, index) => 
            this.compareAnswers(answer, correctAnswers[index])
        );
    }

    /**
     * 显示反馈
     */
    showFeedback(isCorrect) {
        const feedbackDiv = this.container.querySelector('#feedback');
        
        if (isCorrect) {
            this.score++;
            feedbackDiv.innerHTML = `
                <div class="feedback-correct">
                    <div class="feedback-icon">✓</div>
                    <div class="feedback-content">
                        <h4>回答正确！</h4>
                        <p>${this.currentExercise.explanation || '做得好！'}</p>
                    </div>
                </div>
            `;
        } else {
            feedbackDiv.innerHTML = `
                <div class="feedback-incorrect">
                    <div class="feedback-icon">✗</div>
                    <div class="feedback-content">
                        <h4>回答错误</h4>
                        <p>尝试次数: ${this.attempts}</p>
                        ${this.attempts >= 2 ? `
                            <p class="correct-answer">正确答案: ${this.formatAnswer(this.currentExercise.answer)}</p>
                            <p class="explanation">${this.currentExercise.explanation || ''}</p>
                        ` : '<p>再试一次！</p>'}
                    </div>
                </div>
            `;
        }

        feedbackDiv.style.display = 'block';
    }

    /**
     * 显示提示
     */
    showHint() {
        const feedbackDiv = this.container.querySelector('#feedback');
        const hint = this.currentExercise.hint || this.currentExercise.explanation || '暂无提示';
        
        feedbackDiv.innerHTML = `
            <div class="feedback-hint">
                <div class="feedback-icon">💡</div>
                <div class="feedback-content">
                    <h4>提示</h4>
                    <p>${hint}</p>
                </div>
            </div>
        `;
        feedbackDiv.style.display = 'block';
    }

    /**
     * 格式化答案显示
     */
    formatAnswer(answer) {
        if (Array.isArray(answer)) {
            return answer.join(', ');
        }
        return answer.toString();
    }

    /**
     * 获取难度标签
     */
    getDifficultyLabel(difficulty) {
        const labels = {
            'basic': '基础',
            'intermediate': '中级',
            'advanced': '高级',
            'expert': '专家'
        };
        return labels[difficulty] || difficulty;
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            score: this.score,
            totalExercises: this.totalExercises,
            accuracy: this.totalExercises > 0 ? (this.score / this.totalExercises * 100).toFixed(1) : 0
        };
    }

    /**
     * 重置统计
     */
    resetStats() {
        this.score = 0;
        this.totalExercises = 0;
    }
}
