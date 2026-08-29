import cron from 'node-cron';
import { prisma } from './prismaConnection.js';

/**
 * Deletes analytics data older than the configured retention period.
 * The retention value lives in AnalyticsSetting ('retentionDays'), settable
 * from the admin dashboard. Child rows (activity_logs, search_intents,
 * replay_events) are removed automatically via onDelete: Cascade.
 */
export async function purgeExpiredAnalytics() {
  try {
    const row = await prisma.analyticsSetting.findUnique({ where: { key: 'retentionDays' } });
    const n = Number(row?.value);
    const days = Number.isInteger(n) && n > 0 ? n : 30;

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const deleted = await prisma.userSession.deleteMany({
      where: { startedAt: { lt: cutoff } },
    });
    if (deleted.count > 0) {
      console.log(`[ANALYTICS] retention purge: removed ${deleted.count} sessions older than ${days} days`);
    }
    return deleted.count;
  } catch (err) {
    console.error('[ANALYTICS] retention purge error', err);
    return 0;
  }
}

/** Runs the purge once at boot and then every day at 03:00. */
export function scheduleAnalyticsRetention() {
  setTimeout(() => {
    purgeExpiredAnalytics();
  }, 30_000);

  cron.schedule('0 3 * * *', () => {
    purgeExpiredAnalytics();
  });

  console.log('[ANALYTICS] retention scheduler active (daily at 03:00)');
}
