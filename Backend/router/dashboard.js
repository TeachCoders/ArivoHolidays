"use strict";
import express from "express";
const router = express.Router();
import { prisma } from "../utils/prismaConnection.js";
import { requireSalesOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { logger } from "../utils/logger.js";

// GET /api/dashboard/stats — full summary for dashboard home
router.get("/stats", requireSalesOrAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalLeads,
      leadsThisMonth,
      leadsToday,
      confirmedLeads,
      ongoingLeads,
      cancelledLeads,
      chatTotal,
      chatConfirmed,
      chatWorking,
      chatCancelled,
      websiteTotal,
      websiteConfirmed,
      websiteWorking,
      websiteCancelled,
      activeChats,
      unansweredFaqs,
      totalJourneys, activeJourneys,
      totalPackages, activePackages,
      // New: CMS & Content
      totalBlogPosts,
      publishedBlogPosts,
      totalCmsPages,
      publishedCmsPages,
      // New: Geo data
      totalCountries,
      totalStates,
      totalCities,
      // New: People & Vendors
      totalTeams,
      totalUsers,
      totalVendors,
      // New: Bookings breakdown
      tourTotal, tourCompleted, tourOngoing, tourPending, tourCancelled,
      vehicleTotal, vehicleCompleted, vehicleOngoing, vehiclePending, vehicleCancelled,
      // New: Payments breakdown
      paymentTotal, paymentCompleted, paymentOngoing, paymentPending, paymentCancelled,
      // New: Travel data
      totalTravelExperiences,
      totalSeasons,
      // Recent data
      recentLeads,
      recentChats,
      recentJourneys,
      recentBlogPosts,
    ] = await Promise.all([
      // Leads
      prisma.traveller.count(),
      prisma.traveller.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.traveller.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.traveller.count({ where: { bookingStatus: "confirmed" } }),
      prisma.traveller.count({ where: { bookingStatus: "working" } }),
      prisma.traveller.count({ where: { bookingStatus: "cancelled" } }),
      // Chat pipeline
      prisma.traveller.count({ where: { source: "chat" } }),
      prisma.traveller.count({ where: { source: "chat", bookingStatus: "confirmed" } }),
      prisma.traveller.count({ where: { source: "chat", bookingStatus: "working" } }),
      prisma.traveller.count({ where: { source: "chat", bookingStatus: "cancelled" } }),
      // Website pipeline
      prisma.traveller.count({ where: { source: "website" } }),
      prisma.traveller.count({ where: { source: "website", bookingStatus: "confirmed" } }),
      prisma.traveller.count({ where: { source: "website", bookingStatus: "working" } }),
      prisma.traveller.count({ where: { source: "website", bookingStatus: "cancelled" } }),
      // Chat
      prisma.chatConversation.count({ where: { status: "ACTIVE" } }),
      prisma.chatUnanswered.count({ where: { status: "open" } }),
      // Content
      prisma.journey.count(),
      prisma.journey.count({ where: { isActive: true } }),
      prisma.tourPackage.count(),
      prisma.tourPackage.count({ where: { isActive: true } }),
      // Blog
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { isActive: true } }),
      // CMS
      prisma.cmsPage.count(),
      prisma.cmsPage.count({ where: { isActive: true } }),
      // Geo
      prisma.country.count(),
      prisma.state.count(),
      prisma.city.count(),
      // People
      prisma.teams.count(),
      prisma.users.count(),
      prisma.vendor.count(),
      // Bookings Breakdown
      prisma.tourBooking.count(),
      prisma.tourBooking.count({ where: { status: "COMPLETED" } }),
      prisma.tourBooking.count({ where: { status: "ONGOING" } }),
      prisma.tourBooking.count({ where: { status: "UPCOMING" } }),
      prisma.tourBooking.count({ where: { status: "CANCELLED" } }),

      prisma.vehicleBooking.count(),
      prisma.vehicleBooking.count({ where: { status: "COMPLETED" } }),
      prisma.vehicleBooking.count({ where: { status: "ONGOING" } }),
      prisma.vehicleBooking.count({ where: { status: "UPCOMING" } }),
      prisma.vehicleBooking.count({ where: { status: "CANCELLED" } }),

      // Payments Breakdown
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
      prisma.payment.count({ where: { status: "ONGOING" } }),
      prisma.payment.count({ where: { status: "UPCOMING" } }),
      prisma.payment.count({ where: { status: "CANCELLED" } }),
      // Travel data
      prisma.travelExperience.count(),
      prisma.month.count(),
      // Recent leads
      prisma.traveller.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          travellerId: true,
          name: true,
          phone: true,
          country: true,
          destination: true,
          travelDate: true,
          bookingStatus: true,
          createdAt: true,
          assignedTo: { select: { name: true } },
        },
      }),
      // Recent chats
      prisma.chatConversation.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          touristName: true,
          phone: true,
          status: true,
          botState: true,
          createdAt: true,
          lastMessageAt: true,
        },
      }),
      // Recent journeys
      prisma.journey.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          isActive: true,
          createdAt: true,
        },
      }),
      // Recent blog posts
      prisma.blogPost.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          isActive: true,
          createdAt: true,
        },
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        // Leads
        totalLeads,
        leadsThisMonth,
        leadsToday,
        confirmedLeads,
        ongoingLeads,
        cancelledLeads,
        pendingLeads: totalLeads - confirmedLeads - ongoingLeads - cancelledLeads,
        // Pipeline Breakdown
        chatTotal,
        chatConfirmed,
        chatOngoing: chatWorking,
        chatCancelled,
        chatPending: chatTotal - chatConfirmed - chatWorking - chatCancelled,
        websiteTotal,
        websiteConfirmed,
        websiteOngoing: websiteWorking,
        websiteCancelled,
        websitePending: websiteTotal - websiteConfirmed - websiteWorking - websiteCancelled,
        // Chat
        activeChats,
        unansweredFaqs,
        // Content
        totalJourneys,
        activeJourneys,
        totalPackages,
        activePackages,
        // Blog
        totalBlogPosts,
        activeBlogPosts: publishedBlogPosts,
        totalCmsPages,
        activeCmsPages: publishedCmsPages,
        // Geo
        totalCountries,
        totalStates,
        totalCities,
        // People
        totalTeams,
        totalUsers,
        totalVendors,
        // Operations Breakdown
        tourTotal, tourCompleted, tourOngoing, tourPending, tourCancelled,
        vehicleTotal, vehicleCompleted, vehicleOngoing, vehiclePending, vehicleCancelled,
        paymentTotal, paymentCompleted, paymentOngoing, paymentPending, paymentCancelled,
        // Travel
        totalTravelExperiences,
        totalSeasons,
      },
      recentLeads,
      recentChats,
      recentJourneys,
      recentBlogPosts,
    });
  } catch (err) {
    logger.error("Dashboard stats error:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
