import { redirect } from 'next/navigation';

/**
 * /dashboard redirects to the root dashboard page.
 * The root "/" IS the dashboard for Stage 2.
 * This route ensures the sidebar "Dashboard" link resolves correctly.
 */
export default function DashboardRedirectPage() {
  redirect('/');
}
