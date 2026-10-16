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

module.exports = {
  escapeMarkdown
};
