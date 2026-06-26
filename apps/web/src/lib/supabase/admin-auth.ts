import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminRole, Database } from '../types/database'
import { redirect } from 'next/navigation'

export interface AdminSession {
  userId: string
  role: AdminRole
  adminName: string | null
}

export async function requireAdmin(
  supabase: SupabaseClient<Database>,
  requireRole?: AdminRole,
): Promise<AdminSession> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id)
    .single()

  const adminRow = data as { role: AdminRole; is_active: boolean } | null

  if (!adminRow?.is_active) redirect('/home')

  if (requireRole && adminRow.role !== requireRole) {
    redirect('/admin')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return {
    userId: user.id,
    role: adminRow.role,
    adminName: (profile as { full_name: string | null } | null)?.full_name ?? null,
  }
}
