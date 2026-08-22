import { supabase } from '@/shared/config/supabase'
import { clearOfflineData } from '@/shared/lib/offlineDb'

export function useDeleteAccount() {
  const deleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user')
    if (error) throw error
    await clearOfflineData()
    await supabase.auth.signOut()
  }

  return { deleteAccount }
}
