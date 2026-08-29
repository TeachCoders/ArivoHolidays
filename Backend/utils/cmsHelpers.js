import { prisma } from "../utils/prismaConnection.js";

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function upsertBanner(entityType, entityId, bannerData) {
  if (!bannerData) return null;
  const { bannerTitle, bannerTag, bannerImages } = bannerData;
  if (!bannerTitle && !bannerTag && (!bannerImages || bannerImages.length === 0)) return null;

  const existing = await prisma.banner.findFirst({
    where: { entityType, entityId },
  });

  const payload = {
    entityType,
    entityId,
    bannerTitle: bannerTitle || "",
    bannerTag: bannerTag || "",
    images: bannerImages || [],
  };

  if (existing) {
    return prisma.banner.update({
      where: { id: existing.id },
      data: {
        bannerTitle: bannerTitle !== undefined ? bannerTitle : existing.bannerTitle,
        bannerTag: bannerTag !== undefined ? bannerTag : existing.bannerTag,
        images: bannerImages !== undefined ? bannerImages : existing.images,
      },
    });
  }

  return prisma.banner.create({ data: payload });
}

async function getBanner(entityType, entityId) {
  return prisma.banner.findFirst({
    where: { entityType, entityId },
    select: { id: true, bannerTitle: true, bannerTag: true, images: true },
  });
}

async function deleteBanner(entityType, entityId) {
  return prisma.banner.deleteMany({ where: { entityType, entityId } });
}

export { generateSlug, upsertBanner, getBanner, deleteBanner };
