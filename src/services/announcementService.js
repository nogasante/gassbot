const { query } = require('../config/database');
const { getSubscribedUsers } = require('./userService');

async function createAnnouncement({ authorId = null, title, content, priority = 'normal', targetLevel = null }) {
  const res = await query(
    `INSERT INTO announcements (author_id, title, content, priority, target_level)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, author_id, title, content, priority, target_level, created_at;`,
    [authorId, title, content, priority, targetLevel]
  );
  return res.rows[0];
}

async function getRecentAnnouncements({ limit = 10, targetLevel = null } = {}) {
  let q = `
    SELECT a.id, a.author_id, a.title, a.content, a.priority, a.target_level,
           a.broadcasted_at, a.created_at, u.first_name as author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
  `;
  const params = [];
  if (targetLevel) {
    params.push(targetLevel);
    q += ` WHERE a.target_level = $1 OR a.target_level IS NULL`;
  }
  q += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1};`;
  params.push(limit);

  const res = await query(q, params);
  return res.rows;
}

async function markAnnouncementBroadcasted(id) {
  const res = await query(
    `UPDATE announcements
     SET broadcasted_at = NOW()
     WHERE id = $1
     RETURNING id, broadcasted_at;`,
    [id]
  );
  return res.rows[0] || null;
}

async function broadcastAnnouncement(bot, announcement) {
  const recipients = await getSubscribedUsers(announcement.target_level);
  let successCount = 0;
  let failureCount = 0;

  const headerEmoji = announcement.priority === 'urgent' ? '🚨' :
                      announcement.priority === 'academic' ? '📚' :
                      announcement.priority === 'event' ? '🎉' : '📢';

  const messageText = 
`${headerEmoji} *GASS-KNUST ANNOUNCEMENT*
━━━━━━━━━━━━━━━━━━
📌 *${announcement.title}*
${announcement.target_level ? `🎯 *Target:* Level ${announcement.target_level}\n` : ''}
${announcement.content}

━━━━━━━━━━━━━━━━━━
_Ghana Association of Statistics Students_
_Statistics for Development_`;

  for (const user of recipients) {
    try {
      if (bot && bot.api && user.telegram_id) {
        try {
          await bot.api.sendMessage(user.telegram_id, messageText, { parse_mode: 'Markdown' });
        } catch (sendErr) {
          if (sendErr.description && sendErr.description.includes("can't parse entities")) {
            await bot.api.sendMessage(user.telegram_id, messageText);
          } else {
            throw sendErr;
          }
        }
        successCount++;
      }
    } catch (err) {
      // User may have blocked the bot or deleted account
      failureCount++;
    }
  }

  await markAnnouncementBroadcasted(announcement.id);

  return {
    totalRecipients: recipients.length,
    successCount,
    failureCount
  };
}

module.exports = {
  createAnnouncement,
  getRecentAnnouncements,
  markAnnouncementBroadcasted,
  broadcastAnnouncement
};
