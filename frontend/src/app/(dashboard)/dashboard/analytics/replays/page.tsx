import { guardSuperAdmin } from '@/lib/authGuard';
import ReplaysBrowser from './ReplaysBrowser';

export const metadata = {
  title: 'Session Replays | Arivo Holiday',
};

export default async function SessionReplaysPage() {
  await guardSuperAdmin();
  return <ReplaysBrowser />;
}
