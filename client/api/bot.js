import { Bot, webhookCallback } from 'grammy'

const token = process.env.BOT_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

async function rpc(name, payload) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

function formatAmount(amount, currency) {
  const n = Number(amount)
  const value = Number.isInteger(n) ? String(n) : n.toFixed(2)
  return `${value} ${currency === 'RUB' ? '₽' : currency}`
}

const bot = new Bot(token)

bot.use(async (ctx, next) => {
  if (ctx.from) {
    rpc('track_bot_user', {
      p_telegram_id: ctx.from.id,
      p_username: ctx.from.username ?? null,
      p_first_name: ctx.from.first_name ?? null,
    }).catch((err) => console.error('track_bot_user:', err))
  }
  await next()
})

bot.command('start', async (ctx) => {
  const payload = ctx.match?.trim()
  if (!payload) {
    await ctx.reply(
      'Привет! Я бот SubManager.\n\nЧтобы привязать Telegram к аккаунту, открой SubManager → Профиль → «Привязать Telegram» и перейди по ссылке.',
    )
    return
  }
  try {
    const ok = await rpc('consume_link_token', {
      p_token: payload,
      p_telegram_id: ctx.from.id,
      p_telegram_username: ctx.from.username ?? null,
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

bot.callbackQuery(/^pay:(.+)$/, async (ctx) => {
  const splitId = ctx.match[1]
  try {
    const rows = await rpc('pay_split_by_debtor', { p_split_id: splitId, p_telegram_id: ctx.from.id })
    const row = rows?.[0]
    if (!row || row.result === 'not_found') {
      await ctx.answerCallbackQuery('Доля не найдена')
      return
    }
    if (row.result === 'not_yours') {
      await ctx.answerCallbackQuery('Эта кнопка не для тебя')
      return
    }
    if (row.result === 'already_paid') {
      await ctx.answerCallbackQuery('Уже отмечено оплаченным')
      return
    }
    await ctx.answerCallbackQuery('Принято! Владельцу улетело уведомление ✅')
    const keyboard = ctx.callbackQuery.message?.reply_markup?.inline_keyboard ?? []
    const remaining = keyboard.filter((btnRow) => !btnRow.some((b) => b.callback_data === `pay:${splitId}`))
    await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: remaining } })
    if (row.owner_telegram_id) {
      await ctx.api.sendMessage(
        row.owner_telegram_id,
        `💰 @${row.debtor_username} перевёл(а) ${formatAmount(row.amount, row.currency)} за «${row.subscription_title}». Split закрыт.`,
      )
    }
  } catch (err) {
    console.error(err)
    await ctx.answerCallbackQuery('Ошибка, попробуй позже')
  }
})

export default webhookCallback(bot, 'http', { secretToken: process.env.TELEGRAM_WEBHOOK_SECRET })
