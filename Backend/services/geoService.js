"use strict";

/**
 * Server-side IP → country resolution using the free ip-api.com service.
 * Results are cached in-memory (1 hour) to stay within free-tier limits.
 * Private/loopback addresses are skipped (no public lookup possible).
 */

const GEO_API = "http://ip-api.com/json/{ip}?fields=status,countryCode,country,query";
const REQUEST_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 60 * 60 * 1000;

const cache = new Map();

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("127.")) return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const second = Number(ip.split(".")[1] || 0);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

/**
 * Resolves the country for a client IP.
 * @param {string} ip
 * @returns {Promise<{countryCode: string, countryName: string, ip: string} | null>}
 */
export async function resolveCountry(ip) {
  const cleaned = String(ip || "").replace(/^::ffff:/, "").trim();
  if (!cleaned || isPrivateIp(cleaned)) return null;

  if (cache.has(cleaned)) return cache.get(cleaned);

  const url = GEO_API.replace("{ip}", encodeURIComponent(cleaned));
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    const data = await res.json();
    const result =
      data?.status === "success"
        ? {
            countryCode: data.countryCode || "",
            countryName: data.country || "",
            ip: data.query || cleaned,
          }
        : null;

    cache.set(cleaned, result);
    setTimeout(() => cache.delete(cleaned), CACHE_TTL_MS);
    return result;
  } catch {
    return null;
  }
}

/**
 * Extracts the client IP from an Express request (x-forwarded-for aware).
 * @param {import("express").Request} req
 * @returns {string}
 */
export function clientIpFromReq(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const first = String(xff).split(",")[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress || req.ip || "";
}
