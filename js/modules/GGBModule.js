/**
 * GGBModule - GeoGebra 嵌入与扩展
 * 提供 iframe 嵌入 URL 生成、统一配置，供 Skills 与教学页调用
 */
'use strict';

const GGB_BASE = 'https://www.geogebra.org';
const IFRAME_TEMPLATE = `${GGB_BASE}/material/iframe/id/{id}/width/{width}/height/{height}/border/888888/smb/false/stb/false/stbh/false/ai/false/sdz/true/smbg/false/rs/false`;

const DEFAULT_OPTIONS = { width: 800, height: 450 };

/**
 * 根据 GeoGebra 材料 ID 生成嵌入 iframe 的 src
 * @param {string} materialId - 材料 ID（如 k2vxc3zn）
 * @param {{ width?: number, height?: number }} [options]
 * @returns {string}
 */
export function getEmbedUrl(materialId, options = {}) {
    if (!materialId) return '';
    const { width = DEFAULT_OPTIONS.width, height = DEFAULT_OPTIONS.height } = options;
    return IFRAME_TEMPLATE
        .replace(/\{id\}/g, String(materialId))
        .replace(/\{width\}/g, String(width))
        .replace(/\{height\}/g, String(height));
}

/**
 * 根据材料 ID 生成在新窗口打开的完整页面 URL
 * @param {string} materialId
 * @returns {string}
 */
export function getOpenUrl(materialId) {
    return materialId ? `${GGB_BASE}/m/${materialId}` : '';
}

/**
 * 单个 GGB 学件配置 → 嵌入用 HTML 片段（供 UIController 拼接）
 * @param {{ id: string, title?: string, description?: string, materialId: string, openUrl?: string }} applet
 * @param {(s: string) => string} esc - 转义函数
 * @param {number} [width]
 * @param {number} [height]
 * @returns {string}
 */
export function renderAppletHtml(applet, esc, width = 800, height = 450) {
    const mid = applet.materialId || applet.id;
    const openUrl = applet.openUrl || getOpenUrl(mid);
    const src = getEmbedUrl(mid, { width, height });
    const title = esc(applet.title || 'GeoGebra 学件');
    const desc = applet.description ? `<p class="phase2-ggb-desc">${esc(applet.description)}</p>` : '';
    return `
<div class="phase2-ggb-card" data-ggb-id="${esc(mid)}">
  <div class="phase2-ggb-head">
    <span class="phase2-ggb-title">${title}</span>
    <a href="${esc(openUrl)}" target="_blank" rel="noopener noreferrer" class="phase2-ggb-open">在新窗口打开 GGB ↗</a>
  </div>
  ${desc}
  <div class="phase2-ggb-embed">
    <iframe src="${esc(src)}" title="${title}" width="${width}" height="${height}"></iframe>
  </div>
</div>`;
}

export default { getEmbedUrl, getOpenUrl, renderAppletHtml };
