import 'dotenv/config'
import { fetchRetry } from './net.js'

const token = process.env.BOT_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const dry = process.argv.includes('--dry')

if (!token || !supabaseUrl || !supabaseKey) {
  console.error('Заполни BOT_TOKEN, SUPABASE_URL и SUPABASE_KEY в server/.env')
  process.exit(1)
}

const supabaseHeaders = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
}

async function rpc(name) {
  const res = await fetchRetry(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: supabaseHeaders,
    body: '{}',
  })
  if (!res.ok) throw new Error(`${name}: ${res.status} ${await res.text()}`)
  return res.json()
}

const currencySymbols = { RUB: '₽', USD: '$', EUR: '€' }
let fxRates = { RUB: 1, USD: 1 / 80, EUR: 1 / 93 }

async function loadFxRates() {
  try {
    const res = await fetchRetry('https://open.er-api.com/v6/latest/RUB')
    if (!res.ok) return
    const data = await res.json()
    if (data?.rates?.USD && data?.rates?.EUR) {
      fxRates = { RUB: 1, USD: data.rates.USD, EUR: data.rates.EUR }
    }
  } catch {}
}

function formatAmount(amount, currency) {
  const code = currencySymbols[currency] ? currency : 'RUB'
  const converted = Number(amount) * (fxRates[code] ?? 1)
  const value = code === 'RUB' ? String(Math.round(converted)) : converted.toFixed(2)
  return `${value} ${currencySymbols[code]}`
}

function pluralDays(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня'
  return 'дней'
}

function groupBy(rows, key) {
  const map = new Map()
  for (const row of rows) {
    const id = row[key]
    if (id === null || id === undefined) continue
    if (!map.has(id)) map.set(id, [])
    map.get(id).push(row)
  }
  return map
}

async function send(chatId, text, buttons) {
  if (dry) {
    const labels = buttons?.length ? `\nкнопки: ${buttons.map((b) => `[${b.text}]`).join(' ')}` : ''
    console.log(`--- → чат ${chatId}\n${text}${labels}\n`)
    return
  }
  const body = { chat_id: chatId, text }
  if (buttons?.length) {
    body.reply_markup = { inline_keyboard: buttons.map((b) => [{ text: b.text, callback_data: b.callback_data }]) }
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) console.error(`sendMessage в чат ${chatId}: ${res.status} ${await res.text()}`)
}

const today = new Date().toLocaleDateString('sv-SE')

await loadFxRates()

const profilesRes = await fetchRetry(
  `${supabaseUrl}/rest/v1/profiles?select=telegram_id,currency,notify_charge_day,notify_charge_before,notify_splits,notify_weekly_digest&telegram_id=not.is.null`,
  { headers: supabaseHeaders },
)
if (!profilesRes.ok) throw new Error(`profiles: ${profilesRes.status} ${await profilesRes.text()}`)
const profileRows = await profilesRes.json()
const flagsByTg = new Map(profileRows.map((p) => [Number(p.telegram_id), p]))
const flag = (tg, name) => flagsByTg.get(Number(tg))?.[name] !== false
const currencyOf = (tg) => flagsByTg.get(Number(tg))?.currency ?? 'RUB'

const payments = await rpc('get_payment_reminders')
const paymentsByUser = groupBy(payments, 'telegram_id')
let paymentChats = 0
for (const [chatId, rows] of paymentsByUser) {
  const lines = []
  for (const r of rows) {
    const left = r.days_left ?? (r.next_payment_date === today ? 0 : 1)
    if (left === 0 && !flag(chatId, 'notify_charge_day')) continue
    if (left > 0 && !flag(chatId, 'notify_charge_before')) continue
    const when = left === 0 ? 'сегодня' : left === 1 ? 'завтра' : `через ${left} ${pluralDays(left)}`
    lines.push(`• ${r.title} — ${formatAmount(r.amount, currencyOf(chatId))} (${when})`)
  }
  if (!lines.length) continue
  await send(chatId, `⏰ Ближайшие списания:\n\n${lines.join('\n')}`)
  paymentChats++
}

const overdue = await rpc('get_overdue_subscriptions')
const overdueByUser = groupBy(overdue, 'telegram_id')
let overdueChats = 0
for (const [chatId, rows] of overdueByUser) {
  if (!dry) {
    for (const r of rows) {
      await fetchRetry(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${r.id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify({ overdue_notified_for: r.next_payment_date }),
      })
    }
  }
  if (!flag(chatId, 'notify_charge_day')) continue
  const lines = rows.map(
    (r) => `• ${r.title} — ${formatAmount(r.amount, currencyOf(chatId))} (не оплачено ${r.days_overdue} ${pluralDays(r.days_overdue)})`,
  )
  await send(
    chatId,
    `⚠️ Просроченные подписки:\n\n${lines.join('\n')}\n\nПодтверди оплату в приложении — дата следующего списания пересчитается автоматически. Если подписка отменена — удали её.`,
  )
  overdueChats++
}

const splits = await rpc('get_pending_splits')

const debtorDms = groupBy(splits, 'debtor_telegram_id')
let debtorChats = 0
for (const [chatId, rows] of debtorDms) {
  if (!flag(chatId, 'notify_splits')) continue
  const lines = rows.map((r) => {
    const owner = r.owner_telegram_username ? `@${r.owner_telegram_username}` : 'владельцу SubManager'
    return `• ${r.subscription_title} — ${formatAmount(r.amount, currencyOf(chatId))} (${owner})`
  })
  const buttons = rows.map((r) => ({
    text: `Я перевел(а) · ${r.subscription_title}`,
    callback_data: `pay:${r.split_id}`,
  }))
  await send(
    chatId,
    `💸 Напоминание по split\n\nТвои доли в подписках:\n\n${lines.join('\n')}\n\nКак переведёшь — жми кнопку под списком, владельцу прилетит уведомление.`,
    buttons,
  )
  debtorChats++
}

let digestChats = 0
if (new Date().getDay() === 1) {
  const ownerDigests = groupBy(splits, 'owner_telegram_id')
  for (const [chatId, rows] of ownerDigests) {
    if (!flag(chatId, 'notify_weekly_digest')) continue
    const lines = rows.map((r) => `• @${r.debtor_username} — ${formatAmount(r.amount, currencyOf(chatId))} (${r.subscription_title})`)
    await send(
      chatId,
      `💸 Сводка по split за неделю.\n\nТебе ещё не вернули:\n\n${lines.join('\n')}\n\nДрузьям уже улетают напоминания с кнопкой «Я перевел(а)».`,
    )
    digestChats++
  }
}

console.log(
  `Готово: списания → ${paymentChats} чатов, просрочка → ${overdueChats} чатов, друзьям → ${debtorChats} чатов, сводки владельцам → ${digestChats}${dry ? ' (dry-run, ничего не отправлено)' : ''}`,
)
