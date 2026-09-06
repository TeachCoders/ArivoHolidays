import { guardSuperAdmin } from '@/lib/authGuard';
import AnalyticsLayout from '@/components/analytics/AnalyticsLayout';
import ReplaysBrowser from './ReplaysBrowser';

export const metadata = {
  title: 'Session Replays | Arivo Holiday',
};

export default async function SessionReplaysPage() {
  await guardSuperAdmin();
  return (
    <AnalyticsLayout
      title="Visitor Activity (Video)"
      subtitle="Watch recorded visitor sessions from the public website, like a video. Guest visitors only – logged-in users are never recorded."
    >
      <ReplaysBrowser />
    </AnalyticsLayout>
  );
}