// lib/permissions.ts

export const ADMIN_EMAIL = 'judecherish23@gmail.com';

// Hierarchy: Admin (3) > Moderator (2) > Member (1)
const ROLES = {
  'member': 1,
  'moderator': 2,
  'admin': 3
};

export const hasPermission = (userEmail: string, userRole: string, requiredRole: 'admin' | 'moderator' | 'member') => {
  // 1. The Super Admin override
  if (userEmail === ADMIN_EMAIL) return true;

  // 2. Rank Check
  const userLevel = ROLES[userRole as keyof typeof ROLES] || 0;
  const requiredLevel = ROLES[requiredRole];

  return userLevel >= requiredLevel;
};