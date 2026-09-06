import pkg from '@prisma/client';
const { PrismaClient } = pkg;

async function main() {
  // Try to find a journey to link
  const journey = await prisma.journey.findFirst({ where: { isActive: true } });
  
  const page = await prisma.adLandingPage.create({
    data: {
      title: 'Demo Wildlife Safari',
      slug: 'demo-wildlife-safari',
      theme: 'wildlife',
      seoTitle: 'Wildlife Safari Special Offers',
      seoDescription: 'Best wildlife safari tour packages with amazing discounts.',
      heroHeading: 'Experience the Ultimate Wildlife Safari',
      heroSubheading: 'Book now and get 20% off on all wildlife tours.',
      ctaText: 'Enquire Now',
      bannerImages: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80'],
      isActive: true,
      displayOrder: 1,
      linkedJourneyIds: journey ? [journey.id] : [],
      sectionsOrder: [
        { id: "hero", label: "Hero Section" },
        { id: "packages", label: "Selected Packages" },
        { id: "whyUs", label: "Why Choose Us" },
        { id: "faq", label: "FAQ" },
        { id: "cta", label: "CTA Block" }
      ]
    }
  });

  // Create Banner for the page
  await prisma.banner.create({
    data: {
      entityType: 'AdLandingPage',
      entityId: page.id,
      bannerTitle: 'Wildlife Specials',
      bannerTag: 'Trending',
      images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80']
    }
  });

  // Create FAQs for the page
  await prisma.faq.create({
    data: {
      entityType: 'AdLandingPage',
      entityId: page.id,
      ques: 'What is included in the wildlife safari?',
      ans: 'Our packages include transport, accommodation, guided jungle safaris, and all forest entry permits.'
    }
  });

  console.log('Successfully created test landing page:', page.slug);
}

main().catch(console.error).finally(() => prisma.$disconnect());
