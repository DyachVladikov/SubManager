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

function formatAmount(amount, currency) {
  const n = Number(amount)
  const value = Number.isInteger(n) ? String(n) : n.toFixed(2)
  return `${value} ${currency === 'RUB' ? '₽' : currency}`
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

const rolled = await rpc('roll_subscriptions_forward')

const profilesRes = await fetchRetry(
  `${supabaseUrl}/rest/v1/profiles?select=telegram_id,notify_charge_day,notify_charge_before,notify_splits,notify_weekly_digest&telegram_id=not.is.null`,
  { headers: supabaseHeaders },
)
if (!profilesRes.ok) throw new Error(`profiles: ${profilesRes.status} ${await profilesRes.text()}`)
const profileRows = await profilesRes.json()
const flagsByTg = new Map(profileRows.map((p) => [Number(p.telegram_id), p]))
const flag = (tg, name) => flagsByTg.get(Number(tg))?.[name] !== false

const payments = await rpc('get_payment_reminders')
const paymentsByUser = groupBy(payments, 'telegram_id')
let paymentChats = 0
for (const [chatId, rows] of paymentsByUser) {
  const lines = []
  for (const r of rows) {
    const isToday = r.next_payment_date === today
    if (isToday && !flag(chatId, 'notify_charge_day')) continue
    if (!isToday && !flag(chatId, 'notify_charge_before')) continue
    lines.push(`• ${r.title} — ${formatAmount(r.amount, r.currency)} (${isToday ? 'сегодня' : 'завтра'})`)
  }
  if (!lines.length) continue
  await send(chatId, `⏰ Ближайшие списания:\n\n${lines.join('\n')}`)
  paymentChats++
}

const splits = await rpc('get_pending_splits')

const debtorDms = groupBy(splits, 'debtor_telegram_id')
let debtorChats = 0
for (const [chatId, rows] of debtorDms) {
  if (!flag(chatId, 'notify_splits')) continue
  const lines = rows.map((r) => {
    const owner = r.owner_telegram_username ? `@${r.owner_telegram_username}` : 'владельцу SubManager'
    return `• ${r.subscription_title} — ${formatAmount(r.amount, r.currency)} (${owner})`
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
    const lines = rows.map((r) => `• @${r.debtor_username} — ${formatAmount(r.amount, r.currency)} (${r.subscription_title})`)
    await send(
      chatId,
      `💸 Сводка по split за неделю.\n\nТебе ещё не вернули:\n\n${lines.join('\n')}\n\nДрузьям уже улетают напоминания с кнопкой «Я перевел(а)».`,
    )
    digestChats++
  }
}

console.log(
  `Готово: списания → ${paymentChats} чатов, друзьям → ${debtorChats} чатов, сводки владельцам → ${digestChats}, перенесено дат: ${rolled}${dry ? ' (dry-run, ничего не отправлено)' : ''}`,
)
