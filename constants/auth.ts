const defaultEmail = 'demo@example.com';
const ROUTES = {
  HOME: '/',
  KANBAN: '/dashboard/kanban',
  AUTH_ERROR: '/?error=auth_failed'
} as const;

export { defaultEmail, ROUTES };
