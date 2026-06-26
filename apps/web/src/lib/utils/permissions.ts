import type { AdminRole } from '../types/database'

const PERMISSIONS: Record<AdminRole, string[]> = {
  executive: ['dashboard:view', 'users:view', 'verifications:view', 'activity:view'],
  admin: [
    'dashboard:view',
    'users:view',
    'users:moderate',
    'verifications:view',
    'verifications:review',
    'reports:view',
    'reports:moderate',
    'content:view',
    'content:moderate',
    'activity:view',
  ],
  super_admin: ['*'],
}

export function hasPermission(role: AdminRole | null | undefined, permission: string): boolean {
  if (!role) return false
  const perms = PERMISSIONS[role] ?? []
  return perms.includes('*') || perms.includes(permission)
}

export function isSuperAdmin(role: AdminRole | null | undefined): boolean {
  return role === 'super_admin'
}

export function canModerate(role: AdminRole | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function getAdminNavItems(role: AdminRole): { href: string; label: string; permission: string }[] {
  const all = [
    { href: '/admin', label: 'Overview', permission: 'dashboard:view' },
    { href: '/admin/verifications', label: 'Verifications', permission: 'verifications:view' },
    { href: '/admin/reports', label: 'Reports', permission: 'reports:view' },
    { href: '/admin/users', label: 'Users', permission: 'users:view' },
    { href: '/admin/content', label: 'Content', permission: 'content:view' },
    { href: '/admin/activity', label: 'Activity Log', permission: 'activity:view' },
    { href: '/admin/team', label: 'Team', permission: '*' },
  ]
  return all.filter((item) => hasPermission(role, item.permission))
}
