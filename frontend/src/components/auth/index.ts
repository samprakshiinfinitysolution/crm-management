export { default as AuthHeader } from './AuthHeader';
export { default as AuthModeTabs } from './AuthModeTabs';
export { default as RoleSelector } from './RoleSelector';
export { default as RegisterFields } from './RegisterFields';
export { default as AuthForm } from './AuthForm';
export { default as AuthFooter } from './AuthFooter';
export { default as ProtectedRoute, withAuth } from './ProtectedRoute';
export { LogoutDialog, type LogoutDialogProps } from './LogoutDialog';

export const routePermissions = {
  "/dashboard": ["TEAM_LEADER", "SALES_EXECUTIVE"],

  "/leads": ["TEAM_LEADER"],
  "/leads/create": ["TEAM_LEADER"],
  "/my-leads": ["SALES_EXECUTIVE"],

  "/distributions": ["TEAM_LEADER"],
  "/distributions/create": ["TEAM_LEADER"],

  "/users": ["TEAM_LEADER"],
  "/users/create": ["TEAM_LEADER"],

  "/follow-ups": ["TEAM_LEADER", "SALES_EXECUTIVE"],

  "/reports": ["TEAM_LEADER"],
  "/reports/leads": ["TEAM_LEADER"],
  "/reports/performance": ["TEAM_LEADER"],

  "/imports": ["TEAM_LEADER"],
  "/imports/upload": ["TEAM_LEADER"],

  "/notifications": ["TEAM_LEADER", "SALES_EXECUTIVE"],
  "/audit-logs": ["TEAM_LEADER"],

  "/profile": ["TEAM_LEADER", "SALES_EXECUTIVE"],
};