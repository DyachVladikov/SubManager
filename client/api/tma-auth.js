import { createHmac, randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const botToken = process.env.BOT_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

function validateInitData(initData) {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')
  const dataCheckString = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computed = createHmac('sha256', secret).update(dataCheckString).digest('hex')
  if (computed !== hash) return null
  const authDate = Number(params.get('auth_date') ?? 0)
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null
  try {
    return JSON.parse(params.get('user') ?? 'null')
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!botToken || !supabaseUrl || !serviceKey) return res.status(500).json({ error: 'server_not_configured' })
  try {
    const tgUser = validateInitData(String(req.body?.initData ?? ''))
    if (!tgUser?.id) return res.status(401).json({ error: 'invalid_init_data' })

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: profiles } = await supabase.from('profiles').select('id').eq('telegram_id', tgUser.id).limit(1)
    let userId = profiles?.[0]?.id ?? null

    if (!userId) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: `tg_${tgUser.id}@tma.submanager.local`,
        password: randomUUID(),
        email_confirm: true,
        user_metadata: { name: tgUser.first_name ?? null, telegram: true },
      })
      if (createError || !created.user) return res.status(500).json({ error: createError?.message ?? 'create_failed' })
      userId = created.user.id
      await supabase
        .from('profiles')
        .update({ telegram_id: tgUser.id, telegram_username: tgUser.username ?? null })
        .eq('id', userId)
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    const email = userData?.user?.email
    if (userError || !email) return res.status(500).json({ error: 'user_lookup_failed' })

    const { data: link, error: linkError } = await supabase.auth.admin.generateLink({ type: 'magiclink', email })
    if (linkError || !link?.properties?.hashed_token) {
      return res.status(500).json({ error: linkError?.message ?? 'link_failed' })
    }

    return res.status(200).json({ token_hash: link.properties.hashed_token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal' })
  }
}
