import 'dotenv/config'
import { fetchRetry } from './net.js'

const token = process.env.BOT_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const dry = process.argv.includes('--dry')
const message = process.argv
  .slice(2)
  .filter((arg) => arg !== '--dry')
  .join(' ')
  .trim()

if (!token || !supabaseUrl || !supabaseKey) {
  console.error('Заполни BOT_TOKEN, SUPABASE_URL и SUPABASE_KEY в server/.env')
  process.exit(1)
}

if (!message) {
  console.error('Использование: npm run news -- "Текст новости" [--dry]')
  process.exit(1)
}

const res = await fetchRetry(
  `${supabaseUrl}/rest/v1/profiles?select=telegram_id&telegram_id=not.is.null&notify_news=is.true`,
  {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  },
)
if (!res.ok) {
  console.error(`profiles: ${res.status} ${await res.text()}`)
  process.exit(1)
}
const profiles = await res.json()

let sent = 0
for (const profile of profiles) {
  const text = `📢 Новости SubManager\n\n${message}`
  if (dry) {
    console.log(`--- → чат ${profile.telegram_id}\n${text}\n`)
  } else {
    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: profile.telegram_id, text }),
    })
    if (!sendRes.ok) {
      console.error(`sendMessage в чат ${profile.telegram_id}: ${sendRes.status} ${await sendRes.text()}`)
      continue
    }
  }
  sent++
}

console.log(`Готово: новость отправлена в ${sent} чатов${dry ? ' (dry-run, ничего не отправлено)' : ''}`)
