/**
 * Role-to-Dashboard route mapping for School Management ERP
 */
export const ROLE_DASHBOARDS = {
  super_admin: '/super-admin/dashboard',
  admin: '/admin/dashboard',
  principal: '/principal/dashboard',
  teacher: '/teacher/dashboard',
  accountant: '/accountant/dashboard',
  receptionist: '/receptionist/dashboard',
  librarian: '/librarian/dashboard',
  transport_manager: '/transport/dashboard',
  parent: '/parent/dashboard',
  student: '/student/dashboard',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'School Admin',
  principal: 'Principal',
  teacher: 'Teacher',
  accountant: 'Accountant',
  receptionist: 'Receptionist',
  librarian: 'Librarian',
  transport_manager: 'Transport Manager',
  parent: 'Parent',
  student: 'Student',
};

export function getDashboardPath(role) {
  return ROLE_DASHBOARDS[role] || '/admin/dashboard';
}
