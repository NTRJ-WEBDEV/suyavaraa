import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { UsersClient } from '@/components/admin/UsersClient'
import { hasPermission } from '@/lib/utils/permissions'
import type { Tables } from '@/lib/types/database'

type AdminUserRow = Pick<Tables<'users'>, 'id' | 'full_name' | 'email' | 'gender' | 'city' | 'is_verified' | 'is_banned' | 'trust_score' | 'verification_status' | 'created_at' | 'profile_complete'>

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, gender, city, is_verified, is_banned, trust_score, verification_status, created_at, profile_complete')
    .order('created_at', { ascending: false })
    .limit(100) as unknown as { data: AdminUserRow[] | null }

  return (
    <AdminShell role={admin.role} adminName={admin.adminName}>
      <UsersClient
        users={users ?? []}
        adminId={admin.userId}
        canModerate={hasPermission(admin.role, 'users:moderate')}
      />
    </AdminShell>
  )
}
