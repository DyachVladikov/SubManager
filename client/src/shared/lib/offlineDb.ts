import Dexie, { type EntityTable } from 'dexie'

interface CacheRow {
  key: string
  data: unknown
}

export interface OutboxEntry {
  id?: number
  table: 'subscriptions' | 'splits' | 'payments'
  op: 'insert' | 'update' | 'delete'
  payload: Record<string, unknown>
  createdAt: number
}

const db = new Dexie('submanager') as Dexie & {
  cache: EntityTable<CacheRow, 'key'>
  outbox: EntityTable<OutboxEntry, 'id'>
}

db.version(1).stores({
  cache: 'key',
  outbox: '++id',
})

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const row = await db.cache.get(key)
    return (row?.data as T) ?? null
  } catch {
    return null
  }
}

export async function writeCache(key: string, data: unknown): Promise<void> {
  try {
    await db.cache.put({ key, data })
  } catch {}
}

export async function appendCachedList<T extends { id: string }>(key: string, row: T): Promise<void> {
  const list = (await readCache<T[]>(key)) ?? []
  await writeCache(key, [...list.filter((item) => item.id !== row.id), row])
}

export async function updateCachedList<T extends { id: string }>(key: string, id: string, patch: Partial<T>): Promise<void> {
  const list = (await readCache<T[]>(key)) ?? []
  await writeCache(
    key,
    list.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  )
}

export async function removeCachedList(key: string, id: string): Promise<void> {
  const list = (await readCache<{ id: string }[]>(key)) ?? []
  await writeCache(
    key,
    list.filter((item) => item.id !== id),
  )
}

export async function addToOutbox(entry: Omit<OutboxEntry, 'id' | 'createdAt'>): Promise<void> {
  try {
    await db.outbox.add({ ...entry, createdAt: Date.now() })
  } catch {}
}

export async function getOutbox(): Promise<OutboxEntry[]> {
  try {
    return await db.outbox.orderBy('id').toArray()
  } catch {
    return []
  }
}

export async function removeFromOutbox(id: number): Promise<void> {
  try {
    await db.outbox.delete(id)
  } catch {}
}

export async function clearOfflineData(): Promise<void> {
  try {
    await Promise.all([db.cache.clear(), db.outbox.clear()])
  } catch {}
}

export function isOfflineError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true
  const message = String((error as { message?: string } | null)?.message ?? error).toLowerCase()
  return message.includes('failed to fetch') || message.includes('load failed') || message.includes('networkerror')
}
