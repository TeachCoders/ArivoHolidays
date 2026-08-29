import puppeteer from 'puppeteer';

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

/**
 * Strips @import of external fonts from HTML to avoid slow network fetches
 */
function stripExternalFonts(html) {
  return html.replace(/@import\s+url\([^)]+\)\s*;/g, '');
}

/**
 * Generates a PDF buffer from an HTML string
 */
export async function generatePdfFromHtml(html, options = {}) {
  const cleanHtml = stripExternalFonts(html);
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setContent(cleanHtml, { waitUntil: 'domcontentloaded', timeout: 30000 });

  try {
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true,
      ...options,
    });
    return pdfBuffer;
  } finally {
    await page.close();
  }
}

process.on('SIGINT', async () => {
  if (browserInstance) await browserInstance.close();
  process.exit();
});

process.on('SIGTERM', async () => {
  if (browserInstance) await browserInstance.close();
  process.exit();
});
