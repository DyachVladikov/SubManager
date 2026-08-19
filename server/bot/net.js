import 'dotenv/config'
import { lookup as dnsLookup } from 'node:dns'
import { Agent as HttpsAgent } from 'node:https'
import { setGlobalDispatcher, Agent, ProxyAgent } from 'undici'

const pinnedHosts = {
  'api.telegram.org': '149.154.167.220',
}

const supabaseUrl = process.env.SUPABASE_URL
if (supabaseUrl) {
  try {
    pinnedHosts[new URL(supabaseUrl).hostname] = '8.6.112.6'
  } catch {}
}

function lookup(hostname, options, callback) {
  const pinned = pinnedHosts[hostname]
  if (!pinned) return dnsLookup(hostname, options, callback)
  if (options?.all) return callback(null, [{ address: pinned, family: 4 }])
  return callback(null, pinned, 4)
}

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy

if (proxy) {
  setGlobalDispatcher(new ProxyAgent(proxy))
  console.log(`Прокси включён: ${proxy}`)
} else {
  setGlobalDispatcher(new Agent({ connect: { lookup } }))
  console.log(`Закреплённые IP: ${Object.entries(pinnedHosts).map(([host, ip]) => `${host} → ${ip}`).join(', ')}`)
}

export const telegramHttpsAgent = new HttpsAgent({ keepAlive: true, lookup })

export async function fetchRetry(url, options, attempts = 6) {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, options)
    } catch (err) {
      lastError = err
      await new Promise((resolve) => setTimeout(resolve, 700 * (i + 1)))
    }
  }
  throw lastError
}
