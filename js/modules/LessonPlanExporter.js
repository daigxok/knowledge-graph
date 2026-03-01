/**
 * Lesson Plan Exporter
 * Export lesson plans to various formats (Markdown, HTML, PDF)
 */

export class LessonPlanExporter {
    constructor() {
        this.currentLessonPlan = null;
    }
    
    /**
     * Initialize exporter
     */
    initialize() {
        // Listen for export events
        window.addEventListener('exportLessonPlan', (e) => {
            this.currentLessonPlan = e.detail.lessonPlan;
            this.showExportDialog();
        });
    }
    
    /**
     * Show export format selection dialog
     */
    showExportDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'export-dialog';
        dialog.innerHTML = `
            <div class="export-dialog-content">
                <h3>导出教案</h3>
                <p>选择导出格式：</p>
                <div class="export-options">
                    <button class="export-btn" data-format="markdown">📝 Markdown</button>
                    <button class="export-btn" data-format="html">🌐 HTML</button>
                    <button class="export-btn" data-format="pdf">📄 PDF</button>
                </div>
                <button class="export-cancel">取消</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Bind events
        dialog.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.getAttribute('data-format');
                this.export(format);
                dialog.remove();
            });
        });
        
        dialog.querySelector('.export-cancel').addEventListener('click', () => {
            dialog.remove();
        });
    }
    
    /**
     * Export lesson plan
     */
    export(format) {
        if (!this.currentLessonPlan) {
            alert('没有可导出的教案');
            return;
        }
        
        switch (format) {
            case 'markdown':
                this.exportToMarkdown();
                break;
            case 'html':
                this.exportToHTML();
                break;
            case 'pdf':
                this.exportToPDF();
                break;
            default:
                alert('不支持的格式');
        }
    }
    
    /**
     * Export to Markdown
     */
    exportToMarkdown() {
        const lp = this.currentLessonPlan;
        
        let markdown = `# 教案：${lp.nodeName}\n\n`;
        markdown += `**英文名称：** ${lp.nodeNameEn}\n\n`;
        markdown += `**生成时间：** ${new Date(lp.generatedAt).toLocaleString()}\n\n`;
        markdown += `---\n\n`;
        
        lp.sections.forEach(section => {
            markdown += `## ${section.title}\n\n`;
            markdown += `${section.content}\n\n`;
        });
        
        this.downloadFile(
            markdown,
            `教案-${lp.nodeName}.md`,
            'text/markdown'
        );
    }
    
    /**
     * Export to HTML
     */
    exportToHTML() {
        const lp = this.currentLessonPlan;
        
        let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>教案：${lp.nodeName}</title>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #2d3436; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        h2 { color: #667eea; margin-top: 30px; }
        .meta { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .section { margin: 30px 0; }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <h1>教案：${lp.nodeName}</h1>
    <div class="meta">
        <p><strong>英文名称：</strong>${lp.nodeNameEn}</p>
        <p><strong>生成时间：</strong>${new Date(lp.generatedAt).toLocaleString()}</p>
    </div>
`;
        
        lp.sections.forEach(section => {
            html += `    <div class="section">
        <h2>${section.title}</h2>
        ${this.formatContentToHTML(section.content)}
    </div>\n`;
        });
        
        html += `</body>
</html>`;
        
        this.downloadFile(
            html,
            `教案-${lp.nodeName}.html`,
            'text/html'
        );
    }
    
    /**
     * Export to PDF (simplified - uses browser print)
     */
    exportToPDF() {
        // Create a temporary HTML page and open print dialog
        const lp = this.currentLessonPlan;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>教案：${lp.nodeName}</title>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #2d3436; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        h2 { color: #667eea; margin-top: 30px; page-break-after: avoid; }
        .meta { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .section { margin: 30px 0; page-break-inside: avoid; }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <h1>教案：${lp.nodeName}</h1>
    <div class="meta">
        <p><strong>英文名称：</strong>${lp.nodeNameEn}</p>
        <p><strong>生成时间：</strong>${new Date(lp.generatedAt).toLocaleString()}</p>
    </div>
`);
        
        lp.sections.forEach(section => {
            printWindow.document.write(`
    <div class="section">
        <h2>${section.title}</h2>
        ${this.formatContentToHTML(section.content)}
    </div>
`);
        });
        
        printWindow.document.write(`
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 1000);
        };
    </script>
</body>
</html>
`);
        
        printWindow.document.close();
    }
    
    /**
     * Format content to HTML
     */
    formatContentToHTML(content) {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => `<p>${line}</p>`)
            .join('\n        ');
    }
    
    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Export batch lesson plans
     */
    exportBatch(lessonPlans, format = 'markdown') {
        if (!lessonPlans || lessonPlans.length === 0) {
            alert('没有可导出的教案');
            return;
        }
        
        if (format === 'markdown') {
            let markdown = `# 批量教案\n\n`;
            markdown += `**生成时间：** ${new Date().toLocaleString()}\n\n`;
            markdown += `**教案数量：** ${lessonPlans.length}\n\n`;
            markdown += `---\n\n`;
            
            lessonPlans.forEach((lp, index) => {
                markdown += `# ${index + 1}. ${lp.nodeName}\n\n`;
                markdown += `**英文名称：** ${lp.nodeNameEn}\n\n`;
                
                lp.sections.forEach(section => {
                    markdown += `## ${section.title}\n\n`;
                    markdown += `${section.content}\n\n`;
                });
                
                markdown += `\n---\n\n`;
            });
            
            this.downloadFile(
                markdown,
                `批量教案-${lessonPlans.length}个节点.md`,
                'text/markdown'
            );
        }
    }
}

// Export singleton instance
export const lessonPlanExporter = new LessonPlanExporter();
