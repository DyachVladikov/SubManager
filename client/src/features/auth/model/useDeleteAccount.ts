import { supabase } from '@/shared/config/supabase'

export function useDeleteAccount() {
  const deleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user')
    if (error) throw error
    await supabase.auth.signOut()
  }

  return { deleteAccount }
}
