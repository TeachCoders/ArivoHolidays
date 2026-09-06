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

// ── Shared date-range parsing ─────────────────────────────
// Accepts ?from=YYYY-MM-DD&to=YYYY-MM-DD (inclusive, end-of-day on `to`).
// Falls back to the last N days (default 30). Returns { gte, lte } or null.
function parseDateRange(req, fallbackDays = 30) {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  let from, to;
  if (req.query.from && req.query.to) {
    from = new Date(String(req.query.from));
    to = new Date(String(req.query.to));
    if (isNaN(from) || isNaN(to)) return null;
    return { gte: startOfDay(from), lte: endOfDay(to) };
  }
  to = endOfDay(now);
  from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (fallbackDays - 1));
  return { gte: from, lte: to };
}

// Crude UA parser → { browser, os, device }. Works without adding deps.
function parseUserAgent(ua = '') {
  const u = ua.toLowerCase();
  let browser = 'Other';
  if (u.includes('edg/') || u.includes('edge/')) browser = 'Edge';
  else if (u.includes('opr/') || u.includes('opera')) browser = 'Opera';
  else if (u.includes('chrome/') && !u.includes('chromium')) browser = 'Chrome';
  else if (u.includes('safari/') && u.includes('version/')) browser = 'Safari';
  else if (u.includes('firefox/')) browser = 'Firefox';
  else if (u.includes('msie') || u.includes('trident')) browser = 'Internet Explorer';

  let os = 'Other';
  if (u.includes('android')) os = 'Android';
  else if (u.includes('iphone') || u.includes('ipad') || u.includes('ios')) os = 'iOS';
  else if (u.includes('windows')) os = 'Windows';
  else if (u.includes('mac os') || u.includes('macintosh')) os = 'macOS';
  else if (u.includes('linux')) os = 'Linux';

  let device = 'Other';
  if (u.includes('ipad') || (u.includes('tablet') && !u.includes('mobile'))) device = 'Tablet';
  else if (u.includes('mobi')) device = 'Mobile';
  else device = 'Desktop';

  return { browser, os, device };
}

// Best-effort IP → country resolution (fire-and-forget, cached per IP).
// Uses ip-api.com (free, no key). Returns null on localhost/private IPs or any error.
const ipCountryCache = new Map();
async function resolveCountry(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.')) return null;
  if (ipCountryCache.has(ip)) return ipCountryCache.get(ip);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,message`,
      { signal: ctrl.signal, headers: { 'Cache-Control': 'no-cache' } }
    );
    clearTimeout(timer);
    const data = await res.json();
    const country = data?.status === 'success' ? data.country : null;
    ipCountryCache.set(ip, country);
    return country;
  } catch {
    return null;
  }
}

// Classify a referrer (string or null) into an acquisition channel.
function channelFromReferrer(referrer) {
  if (!referrer) return 'Direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    if (host === locationHost()) return 'Direct';
    if (/(^|\.)google\./.test(host) || /(^|\.)bing\./.test(host) || /(^|\.)bing\.com/.test(host) || /(^|\.)yahoo\./.test(host) || /(^|\.)duckduckgo\./.test(host)) return 'Organic Search';
    if (/(^|\.)(facebook|instagram|twitter|x|linkedin|youtube|whatsapp|pinterest|telegram|tiktok|reddit)\./.test(host)) return 'Social';
    return 'Referral';
  } catch {
    return 'Referral';
  }
}

function locationHost() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'localhost').replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
}

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

    const { sessionId, visitorId, events, country, userAgent, deviceType, referrer } = req.body;

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
        ...(referrer ? { referrer } : {}),
        ...(userId !== null ? { userId } : {}),
      },
      create: {
        id: sessionId,
        visitorId,
        country,
        userAgent,
        deviceType: deviceType || parseUserAgent(userAgent).device,
        ipAddress: req.ip,
        ...(referrer ? { referrer } : {}),
        ...(userId !== null ? { userId } : {}),
      },
    }).catch(err => console.error('[ANALYTICS] session upsert error', err));

    // Best-effort geolocation for the country column (fire-and-forget, cached).
    if (req.ip) {
      resolveCountry(req.ip).then(c => {
        if (!c) return;
        prisma.userSession.updateMany({
          where: { id: sessionId, country: null },
          data: { country: c },
        }).catch(() => {});
      }).catch(() => {});
    }

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
 * POST /analytics/resolve-404
 * Delete all BROKEN_LINK entries for a given pagePath (issue resolved).
 */
router.post('/resolve-404', async (req, res) => {
  try {
    const { pagePath } = req.body;
    if (!pagePath) return res.status(400).json({ error: 'pagePath required' });

    const deleted = await prisma.activityLog.deleteMany({
      where: { eventName: 'BROKEN_LINK', pagePath },
    });

    res.json({ success: true, deleted: deleted.count });
  } catch (err) {
    console.error('[ANALYTICS] resolve-404 error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * POST /analytics/high-friction/dismiss
 * Remove a page from the High Friction list by deleting its friction events
 * (RAGE_CLICK / DEAD_CLICK / BROKEN_LINK) for the given pagePath.
 */
router.post('/high-friction/dismiss', async (req, res) => {
  try {
    const { pagePath } = req.body;
    if (!pagePath) return res.status(400).json({ error: 'pagePath required' });

    const deleted = await prisma.activityLog.deleteMany({
      where: {
        pagePath,
        eventName: { in: ['RAGE_CLICK', 'DEAD_CLICK', 'BROKEN_LINK'] },
      },
    });

    res.json({ success: true, deleted: deleted.count });
  } catch (err) {
    console.error('[ANALYTICS] dismiss high-friction error', err);
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
    const range = parseDateRange(req);
    const logRange = range ? { createdAt: { gte: range.gte, lte: range.lte } } : {};

    const totalSessions = await prisma.userSession.count({
      where: range ? { startedAt: { gte: range.gte, lte: range.lte } } : {},
    });

    // Top pages by dwell time
    const topPagesData = await prisma.$queryRaw`
      SELECT
        "pagePath",
        AVG("dwellTimeMs") / 1000 AS "avgTimeSeconds",
        COUNT(*) as "totalVisits"
      FROM "activity_logs"
      WHERE ("eventName" = 'SECTION_DWELL' OR "eventName" = 'PAGE_DWELL')
        AND "createdAt" >= ${range.gte}
        AND "createdAt" <= ${range.lte}
      GROUP BY "pagePath"
      ORDER BY "avgTimeSeconds" DESC
      LIMIT 5;
    `;

    // 404 / not-found page tracking
    // Aggregated count per missing URL the visitor landed on.
    let notFoundData = await prisma.$queryRaw`
      SELECT
        "pagePath",
        COUNT(*) as "hits",
        COUNT(DISTINCT "sessionId") as "visitors"
      FROM "activity_logs"
      WHERE "eventName" = 'BROKEN_LINK'
        AND "createdAt" >= ${range.gte}
        AND "createdAt" <= ${range.lte}
      GROUP BY "pagePath"
      ORDER BY "hits" DESC
      LIMIT 20;
    `;

    // Health check: HEAD request each tracked 404 URL.
    // If the page now loads (200/3xx), delete its BROKEN_LINK entries automatically.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const checkUrl = async (path) => {
      try {
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000),
          redirect: 'follow',
        });
        return { path, ok: res.ok || (res.status >= 300 && res.status < 400) };
      } catch { return { path, ok: false }; }
    };
    const uniquePaths = [...new Set(notFoundData.map((r) => r.pagePath))];
    const healthResults = [];
    for (let i = 0; i < uniquePaths.length; i += 5) {
      healthResults.push(...await Promise.all(uniquePaths.slice(i, i + 5).map(checkUrl)));
    }
    const resolvedPaths = healthResults.filter((r) => r.ok).map((r) => r.path);
    if (resolvedPaths.length > 0) {
      await prisma.activityLog.deleteMany({
        where: { eventName: 'BROKEN_LINK', pagePath: { in: resolvedPaths } },
      });
      notFoundData = notFoundData.filter((r) => !resolvedPaths.includes(r.pagePath));
    }

    // Individual not-found logs for the tracked 404 pages, incl. the page
    // the visitor was redirected from (metadata.from) and the clicked link.
    const notFoundLogsData = await prisma.activityLog.findMany({
      where: {
        eventName: 'BROKEN_LINK',
        pagePath: { in: notFoundData.map((r) => r.pagePath) },
        ...logRange,
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
        AND "createdAt" >= ${range.gte}
        AND "createdAt" <= ${range.lte}
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
      where: range ? { createdAt: { gte: range.gte, lte: range.lte } } : {},
      _count: { _all: true },
      orderBy: { _count: { pageReference: 'desc' } },
      take: 8,
    });

    // Most recent tracked activity (any event type), newest first
    const recentLogs = await prisma.activityLog.findMany({
      where: logRange,
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { eventName: true, pagePath: true, element: true, sectionId: true, dwellTimeMs: true, createdAt: true },
    });

    // High friction pages (high dead/rage/broken-link clicks)
    const highFrictionData = await prisma.activityLog.groupBy({
      by: ['eventName', 'pagePath'],
      where: { eventName: { in: ['RAGE_CLICK', 'DEAD_CLICK', 'BROKEN_LINK'] }, ...logRange },
      _count: { _all: true },
    });
    // Aggregate per page and break down by event type so the dashboard
    // shows exactly which kind of friction happened on each page.
    const highFrictionMap = new Map();
    for (const d of highFrictionData) {
      const cur = highFrictionMap.get(d.pagePath) || {
        pagePath: d.pagePath,
        frictionEvents: 0,
        rageClicks: 0,
        deadClicks: 0,
        brokenLinks: 0,
      };
      cur.frictionEvents += d._count._all;
      if (d.eventName === 'RAGE_CLICK') cur.rageClicks += d._count._all;
      else if (d.eventName === 'DEAD_CLICK') cur.deadClicks += d._count._all;
      else if (d.eventName === 'BROKEN_LINK') cur.brokenLinks += d._count._all;
      highFrictionMap.set(d.pagePath, cur);
    }
    const highFrictionDataFormatted = [...highFrictionMap.values()]
      .sort((a, b) => b.frictionEvents - a.frictionEvents)
      .slice(0, 10);

    // ── Entry / Exit page analysis ────────────────────────────
    // A visit only counts as "qualified" when the guest spent at least
    // 10s on that page – sub-10s bounces are not meaningful.
    const QUALIFY_MS = 10000;

    const allEvents = await prisma.activityLog.findMany({
      where: logRange,
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

    // Journey transitions: consecutive PAGE_VIEWs within a session →
    // top from → to pairs.
    const transitions = new Map();
    const pageSeq = new Map(); // sessionId -> last path
    for (const e of allEvents) {
      if (e.eventName !== 'PAGE_VIEW' || !e.sessionId || !e.pagePath) continue;
      const prev = pageSeq.get(e.sessionId);
      if (prev && prev !== e.pagePath) {
        const key = `${prev} → ${e.pagePath}`;
        const cur = transitions.get(key) || { from: prev, to: e.pagePath, count: 0 };
        cur.count += 1;
        transitions.set(key, cur);
      }
      pageSeq.set(e.sessionId, e.pagePath);
    }
    const journeyTransitions = [...transitions.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily page-view trend for the traffic chart (respects selected range).
    const trendData = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as "date",
        COUNT(*) as "count"
      FROM "activity_logs"
      WHERE "eventName" = 'PAGE_VIEW'
        AND "createdAt" >= ${range.gte}
        AND "createdAt" <= ${range.lte}
      GROUP BY DATE("createdAt")
      ORDER BY "date" ASC;
    `;

    // Visit → lead funnel. Visits = distinct sessions with a page-view/dwell,
    // leads = total submitted enquiries, conversion = leads / visits.
    const visitCount = await prisma.activityLog.count({
      where: { eventName: { in: ['PAGE_VIEW', 'SECTION_DWELL', 'PAGE_DWELL'] }, ...logRange },
    });
    const totalLeads = leadsByPageData.reduce((sum, d) => sum + d._count._all, 0);
    const funnel = {
      totalVisits: visitCount,
      totalLeads,
      conversionRate: visitCount > 0 ? Number(((totalLeads / visitCount) * 100).toFixed(2)) : 0,
    };

    res.json({
      totalSessions,
      trend: formatData(trendData),
      funnel,
      topPages: formatData(topPagesData).map(p => ({
        ...p,
        avgTimeSeconds: p.avgTimeSeconds != null ? Number(p.avgTimeSeconds) : null,
      })),
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
      highFriction: highFrictionDataFormatted,
      journeyTransitions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

/* ─────────────────────────────────────────────
 * LIVE / NOW (real-time view)
 * ───────────────────────────────────────────── */
router.get('/live-now', requireSuperAdmin, async (req, res) => {
  try {
    const minutes = Math.min(parseInt(String(req.query.minutes || '15'), 10) || 15, 120);
    const since = new Date(Date.now() - minutes * 60 * 1000);

    // Distinct sessions with activity in the window + their country/device.
    const activeSessions = await prisma.userSession.findMany({
      where: { startedAt: { gte: since } },
      select: { id: true, country: true, deviceType: true },
    });

    const byCountry = new Map();
    const byDevice = new Map();
    const sessionIds = new Set(activeSessions.map((s) => s.id));
    for (const s of activeSessions) {
      const c = s.country || 'Unknown';
      const d = s.deviceType || 'Other';
      byCountry.set(c, (byCountry.get(c) || 0) + 1);
      byDevice.set(d, (byDevice.get(d) || 0) + 1);
    }

    // Recent live events (last few minutes), for the live feed.
    const recentEvents = await prisma.activityLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { eventName: true, pagePath: true, element: true, dwellTimeMs: true, createdAt: true },
    });

    res.json({
      activeNow: activeSessions.length,
      windowMinutes: minutes,
      byCountry: [...byCountry.entries()].map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
      byDevice: [...byDevice.entries()].map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count),
      recentEvents: recentEvents.map((e) => ({ ...e, createdAt: e.createdAt })),
    });
  } catch (err) {
    console.error('[ANALYTICS] live-now error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/* ─────────────────────────────────────────────
 * AUDIENCE breakdown (device / browser / OS / country)
 * ───────────────────────────────────────────── */
router.get('/breakdown', requireSuperAdmin, async (req, res) => {
  try {
    const range = parseDateRange(req);
    const where = {
      startedAt: range ? { gte: range.gte, lte: range.lte } : undefined,
      visitorId: { not: null },
    };

    const sessions = await prisma.userSession.findMany({
      where,
      select: { deviceType: true, userAgent: true, country: true },
    });

    const devices = new Map();
    const browsers = new Map();
    const os = new Map();
    const countries = new Map();

    for (const s of sessions) {
      const parsed = parseUserAgent(s.userAgent || '');
      const device = s.deviceType || parsed.device || 'Other';
      devices.set(device, (devices.get(device) || 0) + 1);
      browsers.set(parsed.browser, (browsers.get(parsed.browser) || 0) + 1);
      os.set(parsed.os, (os.get(parsed.os) || 0) + 1);
      const c = s.country || 'Unknown';
      countries.set(c, (countries.get(c) || 0) + 1);
    }

    const toArr = (m) => [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    res.json({ totalUsers: sessions.length, devices: toArr(devices), browsers: toArr(browsers), os: toArr(os), countries: toArr(countries) });
  } catch (err) {
    console.error('[ANALYTICS] breakdown error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/* ─────────────────────────────────────────────
 * ACQUISITION sources + search keywords
 * ───────────────────────────────────────────── */
router.get('/sources', requireSuperAdmin, async (req, res) => {
  try {
    const range = parseDateRange(req);
    // Group PAGE_VIEW logs + their referrer context. Referrer is captured in
    // metadata on first touch; fall back to session.
    const where = range ? { createdAt: { gte: range.gte, lte: range.lte } } : {};

    const pageViews = await prisma.activityLog.findMany({
      where: { ...where, eventName: 'PAGE_VIEW' },
      orderBy: { createdAt: 'asc' },
      take: 20000,
      select: { metadata: true, sessionId: true },
    });

    // Distinct sessions by channel to avoid double counting multiple pageviews.
    const sessionsByChannel = new Map(); // channel -> Set(sessionId)
    const sessionsRef = new Map(); // sessionId -> referrer (pv metadata, else session.referrer)
    for (const pv of pageViews) {
      if (!sessionsRef.has(pv.sessionId)) {
        sessionsRef.set(pv.sessionId, pv.metadata?.referrer || null);
      }
    }
    // Fill any session still missing a referrer from the session table.
    const missing = [...sessionsRef.entries()].filter(([, r]) => !r).map(([sid]) => sid);
    if (missing.length > 0) {
      const sessRows = await prisma.userSession.findMany({
        where: { id: { in: missing } },
        select: { id: true, referrer: true },
      });
      for (const row of sessRows) if (row.referrer) sessionsRef.set(row.id, row.referrer);
    }
    for (const [sid, ref] of sessionsRef.entries()) {
      const channel = channelFromReferrer(ref);
      if (!sessionsByChannel.has(channel)) sessionsByChannel.set(channel, new Set());
      sessionsByChannel.get(channel).add(sid);
    }

    const channels = [...sessionsByChannel.entries()].map(([channel, set]) => ({ channel, sessions: set.size }));
    const total = channels.reduce((s, c) => s + c.sessions, 0) || 1;

    // Search keywords extracted from organic search referrers (?q= / ?query=).
    const keywordMap = new Map();
    for (const ref of sessionsRef.values()) {
      if (!ref) continue;
      let url;
      try { url = new URL(ref); } catch { continue; }
      const q = (url.searchParams.get('q') || url.searchParams.get('query') || '').trim();
      if (!q) continue;
      const k = q.toLowerCase();
      keywordMap.set(k, (keywordMap.get(k) || 0) + 1);
    }
    const keywords = [...keywordMap.entries()].map(([keyword, count]) => ({ keyword, count })).sort((a, b) => b.count - a.count).slice(0, 25);

    res.json({ totalSessions: sessionsRef.size, channels: channels.sort((a, b) => b.sessions - a.sessions), keywords });
  } catch (err) {
    console.error('[ANALYTICS] sources error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

/* ─────────────────────────────────────────────
 * SEARCH INTENTS (site-internal search)
 * ───────────────────────────────────────────── */
router.get('/search-intents', requireSuperAdmin, async (req, res) => {
  try {
    const range = parseDateRange(req);
    const where = range ? { createdAt: { gte: range.gte, lte: range.lte } } : {};

    const intents = await prisma.searchIntent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 2000,
      select: { searchQuery: true, destination: true, dateModified: true, filtersApplied: true },
    });

    const queryMap = new Map();
    const destMap = new Map();
    let modifiedCount = 0;
    const filtersMap = new Map();
    for (const it of intents) {
      if (it.searchQuery) {
        const k = it.searchQuery.trim().toLowerCase();
        queryMap.set(k, (queryMap.get(k) || 0) + 1);
      }
      if (it.destination) {
        const k = it.destination.trim();
        destMap.set(k, (destMap.get(k) || 0) + 1);
      }
      if (it.dateModified) modifiedCount += 1;
      const f = it.filtersApplied;
      if (f && typeof f === 'object') {
        for (const [key, val] of Object.entries(f)) {
          if (Array.isArray(val) && val.length) {
            filtersMap.set(key, (filtersMap.get(key) || 0) + val.length);
          }
        }
      }
    }

    res.json({
      totalIntents: intents.length,
      modifiedCount,
      topQueries: [...queryMap.entries()].map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count).slice(0, 15),
      topDestinations: [...destMap.entries()].map(([destination, count]) => ({ destination, count })).sort((a, b) => b.count - a.count).slice(0, 15),
      topFilters: [...filtersMap.entries()].map(([filter, count]) => ({ filter, count })).sort((a, b) => b.count - a.count),
    });
  } catch (err) {
    console.error('[ANALYTICS] search-intents error', err);
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
      select: { id: true, visitorId: true, userId: true, startedAt: true, endedAt: true, country: true, deviceType: true, userAgent: true },
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
        country: s?.country || 'Unknown',
        deviceType: s?.deviceType || parseUserAgent(s?.userAgent || '').device,
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
