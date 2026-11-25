/**
 * Utilities for formatting and sanitizing Telegram bot messages.
 */

/**
 * Escapes characters that have special meaning in Telegram Markdown (v1).
 * Specifically: *, _, `, [, ]
 *
 * @param {string|null|undefined} text
 * @returns {string} Escaped string safe for Markdown parse_mode
 */
function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/[*_`\[\]]/g, (match) => '\\' + match);
}

/**
 * Formats a concise, readable button label for a resource and appends one full-width
 * button per row to the provided InlineKeyboard.
 */
function appendResourceButtons(keyboard, resources, { includeCourseCode = false } = {}) {
  for (const r of resources) {
    const icon = r.telegram_file_id ? '📥' : '🔗';
    const fmt = (r.file_format || 'pdf').toUpperCase();
    const prefix = includeCourseCode && r.course_code ? `${r.course_code}: ` : '';
    const rawTitle = `${prefix}${r.title || 'Untitled'}`.trim();
    const shortTitle = rawTitle.length > 42 ? `${rawTitle.slice(0, 41).trimEnd()}…` : rawTitle;
    const label = `${icon} ${shortTitle} • ${fmt}`;

    if (r.telegram_file_id) {
      keyboard.text(label, `res_send_${r.id}`).row();
    } else if (r.file_url && r.file_url.startsWith('http')) {
      keyboard.url(label, r.file_url).row();
    }
  }
}

module.exports = {
  escapeMarkdown,
  appendResourceButtons
};
