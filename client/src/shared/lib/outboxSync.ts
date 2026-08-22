import type { Dispatch } from '@reduxjs/toolkit'
import { supabase } from '@/shared/config/supabase'
import { baseApi } from '@/shared/api/baseApi'
import { getOutbox, removeFromOutbox } from './offlineDb'

let syncing = false

export async function syncOutbox(dispatch: Dispatch): Promise<void> {
  if (syncing) return
  syncing = true
  try {
    const entries = await getOutbox()
    let syncedAny = false
    for (const entry of entries) {
      try {
        const query =
          entry.op === 'insert'
            ? supabase.from(entry.table).insert([entry.payload])
            : entry.op === 'update'
              ? supabase.from(entry.table).update(entry.payload).eq('id', String(entry.payload.id))
              : supabase.from(entry.table).delete().eq('id', String(entry.payload.id))
        const { error } = await query
        if (error) throw error
        if (entry.id !== undefined) await removeFromOutbox(entry.id)
        syncedAny = true
      } catch {
        break
      }
    }
    if (syncedAny) dispatch(baseApi.util.invalidateTags(['Subscription', 'Profile']))
  } finally {
    syncing = false
  }
}

export function setupOutboxSync(dispatch: Dispatch): void {
  window.addEventListener('online', () => {
    void syncOutbox(dispatch)
  })
  window.addEventListener('focus', () => {
    if (navigator.onLine) void syncOutbox(dispatch)
  })
  if (navigator.onLine) void syncOutbox(dispatch)
}
