import { guardSuperAdmin } from '@/lib/authGuard';
import AnalyticsLayout from '@/components/analytics/AnalyticsLayout';
import AnalyticsClient from '@/components/AnalyticsClient';

/**
 * Analytics dashboard page – server component.
 * Guard ensures only super‑admin users can view it.
 * The UI is delegated to the client component `AnalyticsClient`.
 */
export default async function AnalyticsPage() {
  await guardSuperAdmin();
  return (
    <AnalyticsLayout
      title="Overview"
      subtitle="Sessions, lead flow, friction and live visitor activity"
    >
      <AnalyticsClient />
    </AnalyticsLayout>
  );
}
