import 'dotenv/config'

const token = process.env.BOT_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const dry = process.argv.includes('--dry')

if (!token || !supabaseUrl || !supabaseKey) {
  console.error('Заполни BOT_TOKEN, SUPABASE_URL и SUPABASE_KEY в server/.env')
  process.exit(1)
}

async function rpc(name) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
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

function groupByTelegram(rows) {
  const map = new Map()
  for (const row of rows) {
    if (!map.has(row.telegram_id)) map.set(row.telegram_id, [])
    map.get(row.telegram_id).push(row)
  }
  return map
}

async function send(chatId, text) {
  if (dry) {
    console.log(`--- → чат ${chatId}\n${text}\n`)
    return
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  if (!res.ok) console.error(`sendMessage в чат ${chatId}: ${res.status} ${await res.text()}`)
}

const today = new Date().toLocaleDateString('sv-SE')

const payments = await rpc('get_payment_reminders')
const paymentsByUser = groupByTelegram(payments)
for (const [chatId, rows] of paymentsByUser) {
  const lines = rows.map((r) => {
    const when = r.next_payment_date === today ? 'сегодня' : 'завтра'
    return `• ${r.title} — ${formatAmount(r.amount, r.currency)} (${when})`
  })
  await send(chatId, `⏰ Ближайшие списания:\n\n${lines.join('\n')}`)
}

let splitsChats = 0
if (new Date().getDay() === 1) {
  const splits = await rpc('get_pending_splits')
  const splitsByUser = groupByTelegram(splits)
  for (const [chatId, rows] of splitsByUser) {
    const lines = rows.map(
      (r) => `• @${r.debtor_username.replace(/^@/, '')} — ${formatAmount(r.amount, r.currency)} (${r.subscription_title})`,
    )
    await send(
      chatId,
      `💸 Сводка по split за неделю.\n\nТебе ещё не вернули:\n\n${lines.join('\n')}\n\nЖми «Напомнить» в приложении на вкладке «Друзья».`,
    )
  }
  splitsChats = splitsByUser.size
}

console.log(`Готово: списания → ${paymentsByUser.size} чатов, split → ${splitsChats} чатов${dry ? ' (dry-run, ничего не отправлено)' : ''}`)
