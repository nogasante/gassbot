require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { Bot, InputFile } = require('grammy');
const { config } = require('../src/config');

const execFileAsync = promisify(execFile);

const MANIFEST_PATH = path.join(__dirname, '..', 'src', 'database', 'drive_resources.json');
const DELAY_MS = 1200; // ~50 files/min to stay well under Telegram flood limits
const UPLOAD_TIMEOUT_MS = 300000; // 5m timeout per file so larger PDFs/PPTXs can finish

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms / 1000}s (${label})`)), ms))
  ]);
}

async function downloadFromDrive(driveId, destPath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await execFileAsync('gdrive', ['readonly', 'download', driveId, '--out', destPath], {
        shell: true,
        maxBuffer: 10 * 1024 * 1024
      });
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1500 * attempt);
    }
  }
}

async function sendToTelegramWithRetry(bot, chatId, filePath, item) {
  const caption = `📚 ${item.courseCode} (${item.resourceType === 'past_question' ? 'Past Question' : 'Lecture Slide'})\n📄 ${item.title}`;
  const isImage = ['jpg', 'jpeg', 'png'].includes(item.fileFormat.toLowerCase());

  while (true) {
    try {
      const input = new InputFile(filePath, item.name);
      let msg;
      if (isImage) {
        msg = await withTimeout(
          bot.api.sendPhoto(chatId, input, {
            caption,
            disable_notification: true
          }),
          UPLOAD_TIMEOUT_MS,
          item.name
        );
        const photos = msg.photo || [];
        return photos.length ? photos[photos.length - 1].file_id : null;
      } else {
        msg = await withTimeout(
          bot.api.sendDocument(chatId, input, {
            caption,
            disable_notification: true
          }),
          UPLOAD_TIMEOUT_MS,
          item.name
        );
        return msg.document ? msg.document.file_id : null;
      }
    } catch (err) {
      const retryAfter = err?.parameters?.retry_after;
      if (retryAfter) {
        console.warn(`⏳ Telegram rate limit hit. Waiting ${retryAfter + 1}s...`);
        await sleep((retryAfter + 1) * 1000);
        continue;
      }
      throw err;
    }
  }
}

async function resolveChatId(bot) {
  const argIdx = process.argv.indexOf('--chat-id');
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    return process.argv[argIdx + 1].trim();
  }
  if (process.env.TELEGRAM_STORAGE_CHAT_ID) {
    return process.env.TELEGRAM_STORAGE_CHAT_ID.trim();
  }

  // Try auto-detecting a channel/group from recent updates
  const wh = await bot.api.getWebhookInfo();
  if (!wh.url) {
    const updates = await bot.api.getUpdates({ limit: 50 });
    for (let i = updates.length - 1; i >= 0; i--) {
      const u = updates[i];
      const chat = (u.channel_post || u.message || u.my_chat_member)?.chat;
      if (chat && (chat.type === 'channel' || chat.type === 'supergroup' || chat.type === 'group')) {
        console.log(`🔎 Auto-detected Telegram ${chat.type}: "${chat.title}" (${chat.id})`);
        return String(chat.id);
      }
    }
  }

  return null;
}

async function main() {
  if (!config.botToken) {
    console.error('❌ BOT_TOKEN is missing in .env');
    process.exit(1);
  }
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const bot = new Bot(config.botToken);
  const chatId = await resolveChatId(bot);

  if (!chatId) {
    console.error('❌ No target Telegram chat ID found.');
    console.error('   Add @gassknustbot as admin to your private storage channel and post a message in it,');
    console.error('   or pass --chat-id -100xxxxxxxxxx / set TELEGRAM_STORAGE_CHAT_ID in .env.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const pending = manifest.filter((item) => !item.telegramFileId && item.size <= 50 * 1024 * 1024);

  console.log(`📦 Total resources: ${manifest.length} | Pending upload: ${pending.length} | Target chat: ${chatId}`);

  if (pending.length === 0) {
    console.log('✅ All eligible files already have telegramFileId!');
    return;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gassbot-drive-'));
  let uploaded = 0;
  let failed = 0;

  try {
    for (let i = 0; i < manifest.length; i++) {
      const item = manifest[i];
      if (item.telegramFileId) continue;
      if (item.size > 50 * 1024 * 1024) {
        console.log(`⏭️  Skipping (>50MB): ${item.name}`);
        continue;
      }

      const ext = path.extname(item.name).replace(/[<>:"/\\|?*\s]/g, '');
      const safeName = `${item.driveId}${ext}`;
      const localPath = path.join(tmpDir, safeName);

      try {
        await downloadFromDrive(item.driveId, localPath);
        const fileId = await sendToTelegramWithRetry(bot, chatId, localPath, item);
        if (fileId) {
          item.telegramFileId = fileId;
          item.telegramChatId = String(chatId);
          item.uploadedAt = new Date().toISOString();
          uploaded++;
          fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
          console.log(`✅ [${uploaded}/${pending.length}] ${item.courseCode} | ${item.name}`);
        } else {
          failed++;
          console.warn(`⚠️  No file_id returned for ${item.name}`);
        }
      } catch (err) {
        failed++;
        console.error(`❌ Failed [${item.name}]: ${err.message}`);
      } finally {
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }

      await sleep(DELAY_MS);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log(`\n🎉 Sync complete! Uploaded: ${uploaded}, Failed: ${failed}, Total with file_id: ${manifest.filter(m => m.telegramFileId).length}/${manifest.length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
