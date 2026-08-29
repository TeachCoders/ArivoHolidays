import { prisma } from "./utils/prismaConnection.js";

async function run() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const result = await Promise.all([
      // Leads
      prisma.traveller.count(),
      prisma.traveller.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.traveller.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.traveller.count({ where: { bookingStatus: "confirmed" } }),
      prisma.traveller.count({ where: { bookingStatus: "working" } }),
      prisma.traveller.count({ where: { bookingStatus: "cancelled" } }),
      // Chat
      prisma.chatConversation.count({ where: { status: "ACTIVE" } }),
      prisma.chatUnanswered.count({ where: { status: "open" } }),
      // Content
      prisma.journey.count({ where: { isActive: true } }),
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
      // Bookings
      prisma.tourBooking.count(),
      prisma.vehicleBooking.count(),
      // Payments
      prisma.payment.count({ where: { status: "COMPLETED" } }),
      prisma.payment.count({ where: { status: "UPCOMING" } }),
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
    console.log("Success", result.length);
  } catch (err) {
    console.error(err);
  }
}
run();
