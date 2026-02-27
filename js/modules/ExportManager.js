/**
 * ExportManager - 导出管理器
 * Task 21: 导出与分享功能
 * 需求 18: 导出与分享功能
 */

export class ExportManager {
    constructor() {
        this.exportFormats = ['pdf', 'markdown', 'png', 'json'];
    }

    /**
     * 导出学习路径为PDF
     * Task 21.1: 学习路径导出
     * 需求 18.1: 支持导出当前学习路径为PDF文件
     */
    async exportLearningPathToPDF(path, options = {}) {
        const {
            title = '学习路径',
            author = '知识图谱系统',
            includeDetails = true,
            includeEstimatedTime = true
        } = options;

        // 检查jsPDF是否加载
        if (typeof jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }

        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        // 设置字体（支持中文）
        doc.setFont('helvetica');
        
        // 标题
        doc.setFontSize(20);
        doc.text(title, 20, 20);
        
        // 作者和日期
        doc.setFontSize(10);
        doc.text(`Author: ${author}`, 20, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
        
        // 路径统计
        doc.setFontSize(12);
        doc.text(`Total Nodes: ${path.length}`, 20, 45);
        
        if (includeEstimatedTime) {
            const totalTime = path.reduce((sum, node) => sum + (node.estimatedStudyTime || 60), 0);
            doc.text(`Estimated Time: ${Math.round(totalTime / 60)} hours`, 20, 50);
        }
        
        // 节点列表
        let yPos = 60;
        doc.setFontSize(14);
        doc.text('Learning Path:', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        path.forEach((node, index) => {
            // 检查是否需要新页面
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            // 节点编号和名称
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${node.name || node.nameEn}`, 20, yPos);
            yPos += 5;
            
            // 节点详情
            if (includeDetails) {
                doc.setFont('helvetica', 'normal');
                
                // 难度
                doc.text(`   Difficulty: ${node.difficulty}/5`, 25, yPos);
                yPos += 5;
                
                // 学习时长
                if (node.estimatedStudyTime) {
                    doc.text(`   Study Time: ${node.estimatedStudyTime} min`, 25, yPos);
                    yPos += 5;
                }
                
                // 描述（截断）
                if (node.description) {
                    const desc = node.description.substring(0, 100) + '...';
                    const lines = doc.splitTextToSize(desc, 160);
                    lines.forEach(line => {
                        if (yPos > 270) {
                            doc.addPage();
                            yPos = 20;
                        }
                        doc.text(`   ${line}`, 25, yPos);
                        yPos += 5;
                    });
                }
            }
            
            yPos += 5;
        });
        
        // 保存PDF
        const filename = `learning-path-${Date.now()}.pdf`;
        doc.save(filename);
        
        console.log(`✅ PDF exported: ${filename}`);
        return filename;
    }

    /**
     * 导出节点内容为Markdown
     * Task 21.2: 节点内容导出
     * 需求 18.2: 支持导出选定节点的详细内容为Markdown文件
     */
    exportNodesToMarkdown(nodes, options = {}) {
        const {
            title = '节点内容',
            includeMetadata = true,
            includeFormulas = true,
            includeCode = true
        } = options;

        let markdown = `# ${title}\n\n`;
        markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
        markdown += `Total Nodes: ${nodes.length}\n\n`;
        markdown += '---\n\n';

        nodes.forEach((node, index) => {
            // 节点标题
            markdown += `## ${index + 1}. ${node.name || node.nameEn}\n\n`;
            
            // 元数据
            if (includeMetadata) {
                markdown += `**ID**: ${node.id}\n\n`;
                markdown += `**Difficulty**: ${node.difficulty}/5\n\n`;
                markdown += `**Estimated Study Time**: ${node.estimatedStudyTime || 60} minutes\n\n`;
                
                if (node.domains && node.domains.length > 0) {
                    markdown += `**Domains**: ${node.domains.join(', ')}\n\n`;
                }
                
                if (node.keywords && node.keywords.length > 0) {
                    markdown += `**Keywords**: ${node.keywords.join(', ')}\n\n`;
                }
            }
            
            // 描述
            if (node.description) {
                markdown += `### Description\n\n`;
                markdown += `${node.description}\n\n`;
            }
            
            // 数学公式
            if (includeFormulas && node.formula) {
                markdown += `### Formula\n\n`;
                markdown += `$$${node.formula}$$\n\n`;
            }
            
            // 前置知识
            if (node.prerequisites && node.prerequisites.length > 0) {
                markdown += `### Prerequisites\n\n`;
                node.prerequisites.forEach(preId => {
                    markdown += `- ${preId}\n`;
                });
                markdown += '\n';
            }
            
            // 应用案例
            if (node.applications && node.applications.length > 0) {
                markdown += `### Applications\n\n`;
                node.applications.forEach(app => {
                    markdown += `- ${app}\n`;
                });
                markdown += '\n';
            }
            
            // 代码示例
            if (includeCode && node.codeExample) {
                markdown += `### Code Example\n\n`;
                markdown += '```javascript\n';
                markdown += node.codeExample;
                markdown += '\n```\n\n';
            }
            
            markdown += '---\n\n';
        });

        // 下载Markdown文件
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nodes-export-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log(`✅ Markdown exported: ${a.download}`);
        return a.download;
    }

    /**
     * 导出知识图谱截图为PNG
     * Task 21.3: 图谱截图导出
     * 需求 18.3: 支持导出知识图谱的截图为PNG文件
     */
    async exportGraphToPNG(element, options = {}) {
        const {
            filename = `graph-screenshot-${Date.now()}.png`,
            backgroundColor = '#ffffff',
            scale = 2
        } = options;

        // 检查html2canvas是否加载
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded');
        }

        try {
            const canvas = await html2canvas(element, {
                backgroundColor,
                scale,
                logging: false,
                useCORS: true
            });

            // 转换为PNG并下载
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                
                console.log(`✅ PNG exported: ${filename}`);
            });

            return filename;
        } catch (error) {
            console.error('❌ Failed to export PNG:', error);
            throw error;
        }
    }

    /**
     * 生成可分享的学习路径链接
     * Task 21.4: 分享链接生成
     * 需求 18.4: 生成可分享的学习路径链接
     */
    generateShareLink(data, options = {}) {
        const {
            baseUrl = window.location.origin + window.location.pathname,
            compress = true
        } = options;

        // 编码数据
        const jsonString = JSON.stringify(data);
        let encoded;

        if (compress) {
            // 使用Base64编码（简单压缩）
            encoded = btoa(encodeURIComponent(jsonString));
        } else {
            encoded = encodeURIComponent(jsonString);
        }

        // 生成链接
        const shareUrl = `${baseUrl}?share=${encoded}`;
        
        console.log(`✅ Share link generated: ${shareUrl.substring(0, 100)}...`);
        return shareUrl;
    }

    /**
     * 解析分享链接
     * 需求 18.5: 点击分享链接时加载相同的图谱视图和过滤条件
     */
    parseShareLink(url = window.location.href) {
        const urlObj = new URL(url);
        const shareParam = urlObj.searchParams.get('share');

        if (!shareParam) {
            return null;
        }

        try {
            // 解码数据
            const decoded = decodeURIComponent(atob(shareParam));
            const data = JSON.parse(decoded);
            
            console.log('✅ Share link parsed successfully');
            return data;
        } catch (error) {
            console.error('❌ Failed to parse share link:', error);
            return null;
        }
    }

    /**
     * 导出学习进度为JSON
     * 需求 18.6: 支持导出用户的学习进度数据为JSON文件
     */
    exportProgressToJSON(progress, options = {}) {
        const {
            filename = `learning-progress-${Date.now()}.json`,
            pretty = true
        } = options;

        // 添加元数据
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            progress: progress
        };

        // 转换为JSON
        const jsonString = pretty 
            ? JSON.stringify(exportData, null, 2)
            : JSON.stringify(exportData);

        // 下载JSON文件
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log(`✅ Progress exported: ${filename}`);
        return filename;
    }

    /**
     * 导入学习进度
     */
    async importProgressFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!data.version || !data.progress) {
                        throw new Error('Invalid progress file format');
                    }
                    
                    console.log('✅ Progress imported successfully');
                    resolve(data.progress);
                } catch (error) {
                    console.error('❌ Failed to import progress:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * 复制分享链接到剪贴板
     */
    async copyShareLinkToClipboard(shareUrl) {
        try {
            await navigator.clipboard.writeText(shareUrl);
            console.log('✅ Share link copied to clipboard');
            return true;
        } catch (error) {
            console.error('❌ Failed to copy to clipboard:', error);
            
            // 降级方案：使用传统方法
            const textarea = document.createElement('textarea');
            textarea.value = shareUrl;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                console.log('✅ Share link copied (fallback method)');
                return true;
            } catch (err) {
                document.body.removeChild(textarea);
                console.error('❌ Fallback copy failed:', err);
                return false;
            }
        }
    }

    /**
     * 批量导出
     */
    async exportAll(data, options = {}) {
        const results = {
            pdf: null,
            markdown: null,
            png: null,
            json: null
        };

        try {
            // 导出PDF
            if (data.learningPath && options.exportPDF !== false) {
                results.pdf = await this.exportLearningPathToPDF(data.learningPath);
            }

            // 导出Markdown
            if (data.nodes && options.exportMarkdown !== false) {
                results.markdown = this.exportNodesToMarkdown(data.nodes);
            }

            // 导出PNG
            if (data.graphElement && options.exportPNG !== false) {
                results.png = await this.exportGraphToPNG(data.graphElement);
            }

            // 导出JSON
            if (data.progress && options.exportJSON !== false) {
                results.json = this.exportProgressToJSON(data.progress);
            }

            console.log('✅ Batch export completed:', results);
            return results;
        } catch (error) {
            console.error('❌ Batch export failed:', error);
            throw error;
        }
    }

    /**
     * 获取支持的导出格式
     */
    getSupportedFormats() {
        return this.exportFormats;
    }

    /**
     * 检查库是否已加载
     */
    checkLibraries() {
        return {
            jsPDF: typeof jspdf !== 'undefined',
            html2canvas: typeof html2canvas !== 'undefined'
        };
    }
}

// 导出单例
export const exportManager = new ExportManager();
