import { SITE_URL } from "./apiClient";
import { stripHtml } from "./utils";

function absoluteImage(src?: string): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//.test(src)) return src;
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

export const organizationSchema: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Arivo Holiday",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  telephone: "+919136739178",
  email: "support@arivoholidays.com",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
};

export const websiteSchema: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Arivo Holiday",
  url: SITE_URL,
  description: "Customized holiday tour packages, luxury stays, verified cabs, and local tour guides across India.",
  inLanguage: "en",
};

export function breadcrumbSchema(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

interface ArticleInput {
  title: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  url: string;
}

export function articleSchema(post: ArticleInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description ? stripHtml(post.description).slice(0, 160) : undefined,
    image: absoluteImage(post.image),
    datePublished: post.datePublished || undefined,
    dateModified: post.dateModified || undefined,
    author: post.author
      ? { "@type": "Organization", name: post.author }
      : { "@type": "Organization", name: "Arivo Holiday" },
    publisher: {
      "@type": "Organization",
      name: "Arivo Holiday",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${post.url}`,
    },
  };
}

interface ProductInput {
  name: string;
  description?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  url: string;
}

export function productSchema(pkg: ProductInput): Record<string, unknown> {
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    price: pkg.price,
    priceCurrency: "INR",
    url: `${SITE_URL}${pkg.url}`,
    availability: "https://schema.org/InStock",
  };
  if (pkg.originalPrice && pkg.originalPrice > pkg.price) {
    offer.priceSpecification = {
      "@type": "PriceSpecification",
      price: pkg.price,
      priceCurrency: "INR",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.name,
    description: pkg.description ? stripHtml(pkg.description).slice(0, 160) : undefined,
    image: absoluteImage(pkg.image),
    offers: offer,
  };
}

export function faqSchema(
  faqs: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function itemListSchema(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

interface TouristDestinationInput {
  name: string;
  description?: string;
  image?: string;
  url: string;
}

export function touristDestinationSchema(dest: TouristDestinationInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: dest.name,
    description: dest.description ? stripHtml(dest.description).slice(0, 160) : undefined,
    image: absoluteImage(dest.image),
    url: `${SITE_URL}${dest.url}`,
  };
}
