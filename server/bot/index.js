import 'dotenv/config'
import { Bot } from 'grammy'

const token = process.env.BOT_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!token || !supabaseUrl || !supabaseKey) {
  console.error('Заполни BOT_TOKEN, SUPABASE_URL и SUPABASE_KEY в server/.env')
  process.exit(1)
}

const bot = new Bot(token)

async function consumeLinkToken({ linkToken, telegramId, telegramUsername }) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_link_token`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_token: linkToken,
      p_telegram_id: telegramId,
      p_telegram_username: telegramUsername,
    }),
  })
  if (!res.ok) return false
  return res.json()
}

bot.command('start', async (ctx) => {
  const payload = ctx.match?.trim()
  if (!payload) {
    await ctx.reply(
      'Привет! Я бот SubManager.\n\nЧтобы привязать Telegram к аккаунту, открой SubManager → Профиль → «Привязать Telegram» и перейди по ссылке.',
    )
    return
  }
  try {
    const ok = await consumeLinkToken({
      linkToken: payload,
      telegramId: ctx.from.id,
      telegramUsername: ctx.from.username ?? null,
    })
    if (ok) {
      await ctx.reply(
        'Telegram привязан ✅\n\nВернись в SubManager — там уже всё обновилось. Теперь я смогу напоминать о списаниях и переводах друзей.',
      )
    } else {
      await ctx.reply(
        'Эта ссылка недействительна или уже истекла.\n\nСгенерируй новую: SubManager → Профиль → «Привязать Telegram».',
      )
    }
  } catch (err) {
    console.error(err)
    await ctx.reply('Что-то пошло не так. Попробуй ещё раз чуть позже.')
  }
})

bot.catch((err) => console.error(err))

bot.start()
console.log('SubManager bot запущен (long polling)')
