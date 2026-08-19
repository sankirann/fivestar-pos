import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const BillingPage = lazy(() => import('../pages/billing/page'));
const ReportsPage = lazy(() => import('../pages/reports/page'));
const InventoryPage = lazy(() => import('../pages/inventory/page'));
const MenuPage = lazy(() => import('../pages/menu/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const AccessDeniedPage = lazy(() => import('../pages/access-denied/page'));
const SecurityPage = lazy(() => import('../pages/security/page'));
const UsersPage = lazy(() => import('../pages/users/page'));
const TablesPage = lazy(() => import('../pages/tables/page'));
const KitchenPage = lazy(() => import('../pages/kitchen/page'));
const BackupPage = lazy(() => import('../pages/backup/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/access-denied',
    element: <AccessDeniedPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute permission="billing">
        <BillingPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute permission="reports">
        <ReportsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/inventory',
    element: (
      <ProtectedRoute permission="inventory">
        <InventoryPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/menu',
    element: (
      <ProtectedRoute permission="menu">
        <MenuPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/security',
    element: (
      <ProtectedRoute adminOnly>
        <SecurityPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute adminOnly permission="users">
        <UsersPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/tables',
    element: (
      <ProtectedRoute permission="tables">
        <TablesPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/kitchen',
    element: (
      <ProtectedRoute permission="kitchen">
        <KitchenPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/backup',
    element: (
      <ProtectedRoute adminOnly>
        <BackupPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute permission="analytics">
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
