"use strict";
/**
 * Manual chat cleanup — deletes chat conversations inactive for 30+ days
 * (messages cascade). Leads are kept.
 *
 * Usage:
 *   node scripts/cleanupChat.js            # 30 days
 *   node scripts/cleanupChat.js --days 60  # custom retention
 */
import "dotenv/config";
import { cleanupOldChats, DEFAULT_RETENTION_DAYS } from "../services/chatCleanup.js";

const daysArg = process.argv.find((a) => a.startsWith("--days="));
const days = daysArg ? Number(daysArg.split("=")[1]) : DEFAULT_RETENTION_DAYS;

const { deleted, cutoff } = await cleanupOldChats({ days });
console.log(`Chat cleanup done — deleted ${deleted} inactive conversation(s) older than ${cutoff.toISOString()}.`);
process.exit(0);
