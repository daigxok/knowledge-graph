/**
 * Feedback System
 * 用户反馈收集系统 - 收集用户对Skills和练习的反馈
 */

export class FeedbackSystem {
    constructor() {
        this.feedbackData = [];
        this.sessionId = this.generateSessionId();
    }

    /**
     * 生成会话ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 显示反馈表单
     */
    showFeedbackForm(context = {}) {
        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        modal.innerHTML = `
            <div class="feedback-modal-content">
                <div class="feedback-header">
                    <h2>📝 用户反馈</h2>
                    <button class="feedback-close" aria-label="关闭">&times;</button>
                </div>

                <form class="feedback-form" id="feedbackForm">
                    <div class="form-group">
                        <label>您对这个${context.type || '功能'}的评分:</label>
                        <div class="rating-stars">
                            ${[1,2,3,4,5].map(star => `
                                <span class="star" data-rating="${star}">★</span>
                            `).join('')}
                        </div>
                        <input type="hidden" name="rating" id="rating" required>
                    </div>

                    <div class="form-group">
                        <label>您觉得最有帮助的是:</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" name="helpful" value="visualization"> 可视化效果</label>
                            <label><input type="checkbox" name="helpful" value="explanation"> 解释说明</label>
                            <label><input type="checkbox" name="helpful" value="interaction"> 交互体验</label>
                            <label><input type="checkbox" name="helpful" value="exercises"> 练习题</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>您的建议或意见:</label>
                        <textarea name="comments" rows="4" placeholder="请分享您的想法..."></textarea>
                    </div>

                    <div class="form-group">
                        <label>您会推荐给朋友吗?</label>
                        <div class="radio-group">
                            <label><input type="radio" name="recommend" value="yes" required> 会</label>
                            <label><input type="radio" name="recommend" value="maybe"> 可能</label>
                            <label><input type="radio" name="recommend" value="no"> 不会</label>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-submit">提交反馈</button>
                        <button type="button" class="btn-cancel">取消</button>
                    </div>
                </form>

                <div class="feedback-success hidden">
                    <div class="success-icon">✓</div>
                    <h3>感谢您的反馈！</h3>
                    <p>您的意见对我们非常重要</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachFormHandlers(modal, context);
        this.setupRatingStars(modal);
    }

    /**
     * 设置评分星星
     */
    setupRatingStars(modal) {
        const stars = modal.querySelectorAll('.star');
        const ratingInput = modal.querySelector('#rating');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                ratingInput.value = rating;

                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });

            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
        });

        modal.querySelector('.rating-stars').addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    }

    /**
     * 附加表单处理器
     */
    attachFormHandlers(modal, context) {
        const form = modal.querySelector('#feedbackForm');
        const closeBtn = modal.querySelector('.feedback-close');
        const cancelBtn = modal.querySelector('.btn-cancel');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback(form, context, modal);
        });

        closeBtn.addEventListener('click', () => {
            this.closeFeedbackModal(modal);
        });

        cancelBtn.addEventListener('click', () => {
            this.closeFeedbackModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFeedbackModal(modal);
            }
        });
    }

    /**
     * 提交反馈
     */
    submitFeedback(form, context, modal) {
        const formData = new FormData(form);
        const helpful = formData.getAll('helpful');

        const feedback = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            context: context,
            rating: parseInt(formData.get('rating')),
            helpful: helpful,
            comments: formData.get('comments'),
            recommend: formData.get('recommend')
        };

        this.feedbackData.push(feedback);
        this.saveFeedback(feedback);

        // 显示成功消息
        form.classList.add('hidden');
        modal.querySelector('.feedback-success').classList.remove('hidden');

        setTimeout(() => {
            this.closeFeedbackModal(modal);
        }, 2000);
    }

    /**
     * 保存反馈到本地存储
     */
    saveFeedback(feedback) {
        try {
            const stored = localStorage.getItem('skillsFeedback') || '[]';
            const allFeedback = JSON.parse(stored);
            allFeedback.push(feedback);
            localStorage.setItem('skillsFeedback', JSON.stringify(allFeedback));
            console.log('✅ Feedback saved:', feedback);
        } catch (error) {
            console.error('❌ Failed to save feedback:', error);
        }
    }

    /**
     * 关闭反馈模态框
     */
    closeFeedbackModal(modal) {
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    /**
     * 获取所有反馈
     */
    getAllFeedback() {
        try {
            const stored = localStorage.getItem('skillsFeedback') || '[]';
            return JSON.parse(stored);
        } catch (error) {
            console.error('❌ Failed to load feedback:', error);
            return [];
        }
    }

    /**
     * 获取反馈统计
     */
    getFeedbackStats() {
        const allFeedback = this.getAllFeedback();
        
        if (allFeedback.length === 0) {
            return null;
        }

        const totalRating = allFeedback.reduce((sum, f) => sum + f.rating, 0);
        const avgRating = (totalRating / allFeedback.length).toFixed(1);

        const recommendCount = {
            yes: allFeedback.filter(f => f.recommend === 'yes').length,
            maybe: allFeedback.filter(f => f.recommend === 'maybe').length,
            no: allFeedback.filter(f => f.recommend === 'no').length
        };

        const helpfulFeatures = {};
        allFeedback.forEach(f => {
            f.helpful.forEach(feature => {
                helpfulFeatures[feature] = (helpfulFeatures[feature] || 0) + 1;
            });
        });

        return {
            totalFeedback: allFeedback.length,
            averageRating: avgRating,
            recommendCount: recommendCount,
            helpfulFeatures: helpfulFeatures
        };
    }

    /**
     * 显示反馈统计
     */
    showFeedbackStats() {
        const stats = this.getFeedbackStats();
        
        if (!stats) {
            alert('暂无反馈数据');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        modal.innerHTML = `
            <div class="feedback-modal-content">
                <div class="feedback-header">
                    <h2>📊 反馈统计</h2>
                    <button class="feedback-close" aria-label="关闭">&times;</button>
                </div>

                <div class="stats-content">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalFeedback}</div>
                        <div class="stat-label">总反馈数</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-value">${stats.averageRating} ★</div>
                        <div class="stat-label">平均评分</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-value">${stats.recommendCount.yes}</div>
                        <div class="stat-label">推荐人数</div>
                    </div>

                    <div class="features-chart">
                        <h3>最有帮助的功能</h3>
                        ${Object.entries(stats.helpfulFeatures).map(([feature, count]) => `
                            <div class="feature-bar">
                                <span class="feature-name">${this.getFeatureName(feature)}</span>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${(count / stats.totalFeedback * 100)}%"></div>
                                </div>
                                <span class="feature-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.feedback-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    /**
     * 获取功能名称
     */
    getFeatureName(feature) {
        const names = {
            'visualization': '可视化效果',
            'explanation': '解释说明',
            'interaction': '交互体验',
            'exercises': '练习题'
        };
        return names[feature] || feature;
    }

    /**
     * 导出反馈数据
     */
    exportFeedback() {
        const allFeedback = this.getAllFeedback();
        const dataStr = JSON.stringify(allFeedback, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `feedback_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}
