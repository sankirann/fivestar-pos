import { Permission } from '../types';

interface PermissionMeta {
  label: string;
  icon: string;
  description: string;
  adminOnly: boolean;
}

// Single source of truth for every permission in the system.
export const PERMISSION_META: Record<Permission, PermissionMeta> = {
  billing: {
    label: 'Billing',
    icon: 'ri-shopping-cart-line',
    description: 'Create and print bills',
    adminOnly: false
  },
  menu: {
    label: 'Menu',
    icon: 'ri-restaurant-2-line',
    description: 'Manage menu items and pricing',
    adminOnly: false
  },
  inventory: {
    label: 'Inventory',
    icon: 'ri-archive-line',
    description: 'Manage stock levels',
    adminOnly: false
  },
  reports: {
    label: 'Reports',
    icon: 'ri-file-chart-line',
    description: 'View sales and bill reports',
    adminOnly: false
  },
  analytics: {
    label: 'Analytics',
    icon: 'ri-line-chart-line',
    description: 'View the admin dashboard & analytics',
    adminOnly: false
  },
  kitchen: {
    label: 'Kitchen Display',
    icon: 'ri-fire-line',
    description: 'View and update kitchen order status',
    adminOnly: false
  },
  tables: {
    label: 'Table Management',
    icon: 'ri-layout-grid-line',
    description: 'Manage tables while billing',
    adminOnly: false
  },
  settings: {
    label: 'Settings',
    icon: 'ri-settings-3-line',
    description: 'General app settings',
    adminOnly: false
  },
  users: {
    label: 'Users',
    icon: 'ri-team-line',
    description: 'Create, edit, and remove Manager accounts',
    adminOnly: true
  },
  backup: {
    label: 'Backup',
    icon: 'ri-download-cloud-2-line',
    description: 'Export a full data backup',
    adminOnly: true
  },
  restore: {
    label: 'Restore',
    icon: 'ri-upload-cloud-2-line',
    description: 'Restore data from a backup file',
    adminOnly: true
  },
  security: {
    label: 'Security',
    icon: 'ri-shield-keyhole-line',
    description: 'Change admin credentials & restaurant details',
    adminOnly: true
  }
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_META) as Permission[];

export const ADMIN_ONLY_PERMISSIONS = ALL_PERMISSIONS.filter(
  p => PERMISSION_META[p].adminOnly
);

// Permissions an Admin is allowed to grant to a Manager account.
export const MANAGER_ASSIGNABLE_PERMISSIONS = ALL_PERMISSIONS.filter(
  p => !PERMISSION_META[p].adminOnly
);
