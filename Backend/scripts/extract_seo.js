import { prisma } from '../utils/prismaConnection.js';
import fs from 'fs';
import path from 'path';

const outputFile = path.join(process.cwd(), '../frontend/public/siteoverview.txt');

async function main() {
  let content = "SITE OVERVIEW\n===========================\n\n";

  function appendEntry(url, seoTitle, seoKeyword, seoDescription, pageOverview) {
    content += `URL: ${url}\n`;
    content += `seoTitle: ${seoTitle || ''}\n`;
    content += `seoKeyword: ${seoKeyword || ''}\n`;
    content += `seoDescription: ${seoDescription || ''}\n`;
    content += `pageOverview: ${pageOverview || ''}\n`;
    content += `---------------------------\n\n`;
  }

  console.log('Fetching Countries...');
  const countries = await prisma.country.findMany({ where: { isActive: true, showOnSite: true } });
  for (const c of countries) {
    appendEntry(`/${c.slug}`, c.seoTitle, c.seoKeyword, c.seoDescription, c.overView);
  }

  console.log('Fetching States...');
  const states = await prisma.state.findMany({
    where: { isActive: true, showOnSite: true },
    include: { country: true }
  });
  for (const s of states) {
    const url = `/${s.country?.slug || 'unknown'}/${s.slug}`;
    appendEntry(url, s.seoTitle, s.seoKeyword, s.seoDescription, s.overView);
  }

  console.log('Fetching Cities...');
  const cities = await prisma.city.findMany({
    where: { isActive: true, showOnSite: true },
    include: { state: { include: { country: true } } }
  });
  for (const c of cities) {
    const url = `/${c.state?.country?.slug || 'unknown'}/${c.state?.slug || 'unknown'}/${c.slug}`;
    appendEntry(url, c.seoTitle, c.seoKeyword, c.seoDescription, c.overView);
  }

  console.log('Fetching Journeys...');
  const journeys = await prisma.journey.findMany({ where: { isActive: true } });
  for (const j of journeys) {
    appendEntry(`/${j.slug}`, j.seoTitle, j.seoKeyword, j.seoDescription, j.overView);
  }

  console.log('Fetching CMS Pages...');
  const cmsPages = await prisma.cmsPage.findMany({ where: { isActive: true } });
  for (const p of cmsPages) {
    appendEntry(`/${p.slug}`, p.seoTitle, p.seoKeyword, p.seoDescription, p.moreDescription);
  }

  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log('Successfully wrote to ' + outputFile);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
