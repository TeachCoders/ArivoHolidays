import { Router } from 'express';
import { prisma } from '../utils/prismaConnection.js';
import rateLimit from 'express-rate-limit';
import { requireSuperAdmin } from '../middleware/requireSuperAdmin.js';

const router = Router();

const RETENTION_KEY = 'retentionDays';
const DEFAULT_RETENTION_DAYS = 30;

// Rate limiting to prevent abuse
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { error: 'Too many analytics events, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /analytics/events
 * Batched or single event ingestion route
 */
router.post('/events', analyticsLimiter, async (req, res) => {
  try {
    // Guests only: silently ignore batches from authenticated sessions.
    if (req.session?.user?.id != null) {
      return res.status(202).json({ success: true, discarded: 'authenticated-session' });
    }

    const { sessionId, visitorId, events, country, userAgent, deviceType } = req.body;

    if (!sessionId || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'sessionId and events array required' });
    }

    // Prefer the server-side session user; fall back to the client-provided id.
    const bodyUserId = Number(req.body.userId);
    const userId = Number.isInteger(req.session?.user?.id)
      ? req.session.user.id
      : Number.isInteger(bodyUserId)
        ? bodyUserId
        : null;

    // Upsert the session asynchronously
    await prisma.userSession.upsert({
      where: { id: sessionId },
      update: {
        endedAt: new Date(),
        totalTimeSpent: req.body.totalTimeSpent || 0,
        ...(userId !== null ? { userId } : {}),
      },
      create: {
        id: sessionId,
        visitorId,
        country,
        userAgent,
        deviceType,
        ipAddress: req.ip,
        ...(userId !== null ? { userId } : {}),
      },
    }).catch(err => console.error('[ANALYTICS] session upsert error', err));

    // Process activity logs
    const activityLogs = events
      .filter(e => e.type !== 'SEARCH_INTENT')
      .map(e => ({
        sessionId,
        eventName: e.eventName,
        pagePath: e.pagePath,
        sectionId: e.sectionId,
        dwellTimeMs: e.dwellTimeMs,
        element: e.element,
        metadata: e.metadata || {},
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      }));

    if (activityLogs.length > 0) {
      await prisma.activityLog.createMany({
        data: activityLogs,
        skipDuplicates: true,
      });
    }

    // Process search intents
    const searchIntents = events
      .filter(e => e.type === 'SEARCH_INTENT')
      .map(e => ({
        sessionId,
        searchQuery: e.metadata?.searchQuery,
        destination: e.metadata?.destination,
        dateModified: e.metadata?.dateModified || false,
        filtersApplied: e.metadata?.filtersApplied || {},
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      }));

    if (searchIntents.length > 0) {
      await prisma.searchIntent.createMany({
        data: searchIntents,
        skipDuplicates: true,
      });
    }

    res.status(202).json({ success: true, processed: events.length });
  } catch (err) {
    console.error('[ANALYTICS] error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * GET /analytics/kpi/high-friction
 * KPI: High friction pages (high dead/rage clicks)
 */
router.get('/kpi/high-friction', async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        "pagePath", 
        COUNT(*) as "frictionEvents"
      FROM "activity_logs"
      WHERE "eventName" IN ('RAGE_CLICK', 'DEAD_CLICK', 'BROKEN_LINK')
      GROUP BY "pagePath"
      ORDER BY "frictionEvents" DESC
      LIMIT 10;
    `;
    // Prisma returns BigInt for COUNT, convert to Number
    const formattedData = data.map(d => ({
      ...d,
      frictionEvents: Number(d.frictionEvents)
    }));
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * GET /analytics/kpi/top-elements
 * KPI: Most clicked buttons/links (CLICK events grouped by element)
 */
router.get('/kpi/top-elements', async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT
        "pagePath",
        "element",
        COUNT(*) as "clicks",
        MAX("metadata"->>'text') as "sampleText"
      FROM "activity_logs"
      WHERE "eventName" = 'CLICK'
      GROUP BY "pagePath", "element"
      ORDER BY "clicks" DESC
      LIMIT 10;
    `;
    const formattedData = data.map(d => ({
      ...d,
      clicks: Number(d.clicks)
    }));
    res.json(formattedData);
  } catch (err) {
    console.error('[ANALYTICS] top-elements error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * GET /analytics/stats
 * comprehensive stats for dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const totalSessions = await prisma.userSession.count();

    // Top pages by dwell time
    const topPagesData = await prisma.$queryRaw`
      SELECT
        "pagePath",
        AVG("dwellTimeMs") / 1000 AS "avgTimeSeconds",
        COUNT(*) as "totalVisits"
      FROM "activity_logs"
      WHERE "eventName" = 'SECTION_DWELL' OR "eventName" = 'PAGE_VIEW'
      GROUP BY "pagePath"
      ORDER BY "avgTimeSeconds" DESC
      LIMIT 5;
    `;

    // 404 / not-found page tracking
    // Aggregated count per missing URL the visitor landed on.
    const notFoundData = await prisma.$queryRaw`
      SELECT
        "pagePath",
        COUNT(*) as "hits",
        COUNT(DISTINCT "sessionId") as "visitors"
      FROM "activity_logs"
      WHERE "eventName" = 'BROKEN_LINK'
      GROUP BY "pagePath"
      ORDER BY "hits" DESC
      LIMIT 20;
    `;

    // Individual not-found logs for the tracked 404 pages, incl. the page
    // the visitor was redirected from (metadata.from) and the clicked link.
    const notFoundLogsData = await prisma.activityLog.findMany({
      where: {
        eventName: 'BROKEN_LINK',
        pagePath: { in: notFoundData.map((r) => r.pagePath) },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        sessionId: true,
        pagePath: true,
        element: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Most clicked elements (buttons, links, form controls)
    const topElementsData = await prisma.$queryRaw`
      SELECT
        "pagePath",
        "element",
        COUNT(*) as "clicks",
        MAX("metadata"->>'text') as "sampleText"
      FROM "activity_logs"
      WHERE "eventName" = 'CLICK'
      GROUP BY "pagePath", "element"
      ORDER BY "clicks" DESC
      LIMIT 5;
    `;

    // format BigInts
    const formatData = (data) => data.map(d => {
      const obj = {};
      for (const key in d) {
        obj[key] = typeof d[key] === 'bigint' ? Number(d[key]) : d[key];
      }
      return obj;
    });

    // Leads grouped by the page they were submitted from
    const leadsByPageData = await prisma.traveller.groupBy({
      by: ['pageReference'],
      _count: { _all: true },
      orderBy: { _count: { pageReference: 'desc' } },
      take: 8,
    });

    // Most recent tracked activity (any event type), newest first
    const recentLogs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { eventName: true, pagePath: true, element: true, sectionId: true, dwellTimeMs: true, createdAt: true },
    });

    // ── Entry / Exit page analysis ────────────────────────────
    // A visit only counts as "qualified" when the guest spent at least
    // 10s on that page – sub-10s bounces are not meaningful.
    const QUALIFY_MS = 10000;

    const allEvents = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'asc' },
      select: { sessionId: true, eventName: true, pagePath: true, dwellTimeMs: true },
    });

    // Per session: first/last page + exact dwell time per path (PAGE_DWELL)
    const sessions = new Map();
    for (const e of allEvents) {
      if (!e.sessionId || !e.pagePath) continue;
      let s = sessions.get(e.sessionId);
      if (!s) {
        s = { first: e.pagePath, last: e.pagePath, dwellByPath: new Map() };
        sessions.set(e.sessionId, s);
      }
      s.last = e.pagePath;
      if (e.eventName === 'PAGE_DWELL' && typeof e.dwellTimeMs === 'number') {
        s.dwellByPath.set(e.pagePath, (s.dwellByPath.get(e.pagePath) || 0) + e.dwellTimeMs);
      }
    }

    const buildFlow = (pick) => {
      const agg = new Map();
      for (const s of sessions.values()) {
        const path = pick(s);
        const dwell = s.dwellByPath.get(path) || 0;
        const a = agg.get(path) || { entries: 0, valid: 0, dwellSum: 0 };
        a.entries += 1;
        if (dwell >= QUALIFY_MS) {
          a.valid += 1;
          a.dwellSum += dwell;
        }
        agg.set(path, a);
      }
      return [...agg.entries()]
        .map(([pagePath, a]) => ({
          pagePath,
          entries: a.entries,
          qualified: a.valid,
          avgSeconds: a.valid ? Number((a.dwellSum / a.valid / 1000).toFixed(1)) : null,
        }))
        .sort((x, y) => y.qualified - x.qualified || y.entries - x.entries)
        .slice(0, 8);
    };

    const entryPages = buildFlow((s) => s.first);
    const exitPages = buildFlow((s) => s.last);

    res.json({
      totalSessions,
      topPages: formatData(topPagesData),
      notFound: formatData(notFoundData).map(p => {
        // One not-found log per landing; group the source pages (metadata.from)
        // that redirected/led the visitor to this missing URL.
        const logs = notFoundLogsData.filter(i => i.pagePath === p.pagePath);
        const fromMap = new Map();
        for (const l of logs) {
          const from = l.metadata?.from || "Direct / Unknown";
          const cur = fromMap.get(from) || { source: from, count: 0, lastAt: null };
          cur.count += 1;
          if (!cur.lastAt || new Date(l.createdAt) > new Date(cur.lastAt)) cur.lastAt = l.createdAt;
          fromMap.set(from, cur);
        }
        const fromPages = [...fromMap.values()]
          .sort((a, b) => b.count - a.count)
          .map(s => ({
            source: s.source,
            count: s.count,
            lastAt: s.lastAt,
          }));
        const issues = logs.map(l => ({
          source: l.metadata?.from || "Direct / Unknown",
          clickedLink: l.element || null,
          clickedText: l.metadata?.clickedText || null,
          referrer: l.metadata?.referrer || null,
          sessionId: l.sessionId,
          createdAt: l.createdAt,
        }));
        return { ...p, fromPages, issues };
      }),
      topElements: formatData(topElementsData),
      leadsByPage: formatData(leadsByPageData).map(d => ({
        pagePath: d.pageReference || "unknown",
        leads: d._all,
      })),
      recent: recentLogs.map(l => ({ ...l, createdAt: l.createdAt })),
      entryPages,
      exitPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;

/* ─────────────────────────────────────────────
 * SESSION REPLAY (rrweb)
 * ───────────────────────────────────────────── */

const replayLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /analytics/replay
 * Ingest a batch of rrweb events for a session.
 */
router.post('/replay', replayLimiter, async (req, res) => {
  try {
    // Guests only: silently ignore recordings from authenticated sessions.
    if (req.session?.user?.id != null) {
      return res.status(202).json({ success: true, discarded: 'authenticated-session' });
    }

    const { sessionId, visitorId, events } = req.body;
    if (!sessionId || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'sessionId and non-empty events array required' });
    }

    const bodyUserId = Number(req.body.userId);
    const userId = Number.isInteger(req.session?.user?.id)
      ? req.session.user.id
      : Number.isInteger(bodyUserId)
        ? bodyUserId
        : null;

    await prisma.userSession.upsert({
      where: { id: sessionId },
      update: { endedAt: new Date(), ...(userId !== null ? { userId } : {}) },
      create: {
        id: sessionId,
        visitorId,
        userAgent: req.body.userAgent,
        deviceType: req.body.deviceType,
        ipAddress: req.ip,
        ...(userId !== null ? { userId } : {}),
      },
    }).catch(err => console.error('[ANALYTICS] replay session upsert error', err));

    // Split oversized batches into chunks to stay well within column/body limits
    const CHUNK = 500;
    const batches = [];
    for (let i = 0; i < events.length; i += CHUNK) {
      batches.push({ sessionId, events: events.slice(i, i + CHUNK) });
    }
    await prisma.replayEvent.createMany({ data: batches });

    res.status(202).json({ success: true, stored: batches.length });
  } catch (err) {
    console.error('[ANALYTICS] replay ingest error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * GET /analytics/replay-sessions  (super admin)
 * Sessions that have recorded replays, newest first.
 */
router.get('/replay-sessions', requireSuperAdmin, async (req, res) => {
  try {
    const rows = await prisma.replayEvent.groupBy({
      by: ['sessionId'],
      _count: { id: true },
      _min: { createdAt: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
      take: 50,
    });

    const sessions = await prisma.userSession.findMany({
      where: { id: { in: rows.map(r => r.sessionId) } },
      select: { id: true, visitorId: true, userId: true, startedAt: true, endedAt: true, country: true, deviceType: true },
    });
    const sessionMap = new Map(sessions.map(s => [s.id, s]));

    const userIds = [...new Set(sessions.map(s => s.userId).filter(Boolean))];
    const users = userIds.length
      ? await prisma.users.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    res.json(rows.map(r => {
      const s = sessionMap.get(r.sessionId);
      return {
        sessionId: r.sessionId,
        visitorId: s?.visitorId || null,
        country: s?.country || null,
        deviceType: s?.deviceType || null,
        user: s?.userId ? (userMap.get(s.userId) || null) : null,
        batchCount: r._count.id,
        startedAt: s?.startedAt || r._min.createdAt,
        lastEventAt: r._max.createdAt,
      };
    }));
  } catch (err) {
    console.error('[ANALYTICS] replay-sessions error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * GET /analytics/session/:sessionId/analysis  (super admin)
 * Per-session behavioural breakdown shown next to its replay video.
 */
router.get('/session/:sessionId/analysis', requireSuperAdmin, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const [session, logs] = await Promise.all([
      prisma.userSession.findUnique({
        where: { id: sessionId },
        select: { id: true, visitorId: true, userId: true, startedAt: true, endedAt: true, totalTimeSpent: true, country: true, deviceType: true },
      }),
      prisma.activityLog.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        select: { eventName: true, pagePath: true, element: true, sectionId: true, dwellTimeMs: true, metadata: true, createdAt: true },
      }),
    ]);
    if (!session) return res.status(404).json({ error: 'session not found' });

    let user = null;
    if (session.userId) {
      const u = await prisma.users.findUnique({ where: { id: session.userId }, select: { id: true, name: true, email: true } });
      user = u || null;
    }

    const count = (name) => logs.filter(l => l.eventName === name).length;
    const totals = {
      totalEvents: logs.length,
      pageViews: count('PAGE_VIEW'),
      clicks: count('CLICK'),
      rageClicks: count('RAGE_CLICK'),
      deadClicks: count('DEAD_CLICK'),
      brokenLinks: count('BROKEN_LINK'),
      dwells: count('SECTION_DWELL'),
      searches: count('SEARCH_INTENT'),
    };

    // Pages visited with visit counts and average dwell time on that page
    const pageMap = new Map();
    for (const l of logs) {
      if (!l.pagePath) continue;
      const p = pageMap.get(l.pagePath) || { pagePath: l.pagePath, visits: 0, dwellSum: 0, dwellCount: 0 };
      if (l.eventName === 'PAGE_VIEW') p.visits += 1;
      if (l.eventName === 'SECTION_DWELL' && typeof l.dwellTimeMs === 'number') {
        p.dwellSum += l.dwellTimeMs;
        p.dwellCount += 1;
      }
      pageMap.set(l.pagePath, p);
    }
    const pages = [...pageMap.values()]
      .map(p => ({
        pagePath: p.pagePath,
        visits: p.visits,
        avgDwellSeconds: p.dwellCount ? Number((p.dwellSum / p.dwellCount / 1000).toFixed(1)) : null,
      }))
      .sort((a, b) => b.visits - a.visits);

    // Most clicked elements in this session
    const elMap = new Map();
    for (const l of logs) {
      if ((l.eventName === 'CLICK' || l.eventName === 'RAGE_CLICK') && l.element) {
        elMap.set(l.element, (elMap.get(l.element) || 0) + 1);
      }
    }
    const elements = [...elMap.entries()]
      .map(([element, clicks]) => ({ element, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8);

    // Friction moments with context
    const friction = logs
      .filter(l => ['RAGE_CLICK', 'DEAD_CLICK', 'BROKEN_LINK'].includes(l.eventName))
      .slice(-10)
      .reverse()
      .map(l => ({ at: l.createdAt, eventName: l.eventName, pagePath: l.pagePath, element: l.element, metadata: l.metadata }));

    // Compact recent timeline (last 25 events)
    const timeline = logs.slice(-25).reverse().map(l => ({
      at: l.createdAt,
      eventName: l.eventName,
      pagePath: l.pagePath,
      element: l.element,
      sectionId: l.sectionId,
      dwellTimeMs: typeof l.dwellTimeMs === 'number' ? l.dwellTimeMs : null,
    }));

    res.json({ session: { ...session, user }, totals, pages, elements, friction, timeline });
  } catch (err) {
    console.error('[ANALYTICS] session analysis error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * GET /analytics/replay/:sessionId  (super admin)
 * Full ordered event stream for one session – playable in rrweb-player.
 */
router.get('/replay/:sessionId', requireSuperAdmin, async (req, res) => {
  try {
    const batches = await prisma.replayEvent.findMany({
      where: { sessionId: req.params.sessionId },
      orderBy: { createdAt: 'asc' },
    });
    // Batches were flushed sequentially; restore order by flattening.
    const events = batches.flatMap(b => Array.isArray(b.events) ? b.events : []);
    res.json({ sessionId: req.params.sessionId, count: events.length, events });
  } catch (err) {
    console.error('[ANALYTICS] replay fetch error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * DELETE /analytics/replay/:sessionId  (super admin)
 */
router.delete('/replay/:sessionId', requireSuperAdmin, async (req, res) => {
  try {
    await prisma.replayEvent.deleteMany({ where: { sessionId: req.params.sessionId } });
    res.json({ success: true });
  } catch (err) {
    console.error('[ANALYTICS] replay delete error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/* ─────────────────────────────────────────────
 * DATA RETENTION (auto-delete after N days)
 * ───────────────────────────────────────────── */

async function getRetentionDays() {
  const row = await prisma.analyticsSetting.findUnique({ where: { key: RETENTION_KEY } });
  const n = Number(row?.value);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_RETENTION_DAYS;
}

router.get('/retention-days', requireSuperAdmin, async (req, res) => {
  try {
    res.json({ retentionDays: await getRetentionDays() });
  } catch (err) {
    console.error('[ANALYTICS] retention get error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

router.put('/retention-days', requireSuperAdmin, async (req, res) => {
  try {
    const days = Number(req.body.retentionDays);
    if (!Number.isInteger(days) || days < 1 || days > 3650) {
      return res.status(400).json({ success: false, message: 'retentionDays must be an integer between 1 and 3650' });
    }
    await prisma.analyticsSetting.upsert({
      where: { key: RETENTION_KEY },
      update: { value: String(days) },
      create: { key: RETENTION_KEY, value: String(days) },
    });
    res.json({ success: true, retentionDays: days });
  } catch (err) {
    console.error('[ANALYTICS] retention set error', err);
    res.status(500).json({ error: 'internal error' });
  }
});
