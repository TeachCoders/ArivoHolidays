import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BlogCard from "@/feature/blog/components/BlogCard";
import BlogSidebar from "@/feature/blog/components/BlogSidebar";
import RichContent from "@/components/shared/RichContent";
import JsonLd from "@/components/shared/JsonLd";
import { articleSchema, breadcrumbSchema } from "@/lib/jsonLd";
import { fetchBySlug, SERVER_API_BASE } from "@/feature/destinations/api/public-server";
import { stripHtml } from "@/lib/utils";
import type { BlogPost } from "@/feature/blog/type";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBySlug<BlogPost>("/blog/by-slug", slug);
  if (!post) return { title: "Blog Post Not Found | Arivo Holiday" };
  const seoDescription = stripHtml(post.seoDescription || post.moreDescription || "").slice(0, 160);
  const title = post.seoTitle || post.title;
  const canonical = post.canonical || `/blog/${post.slug}`;
  return {
    title,
    description: seoDescription || undefined,
    keywords: post.seoKeyword || undefined,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description: seoDescription || undefined,
      url: canonical,
      publishedTime: post.publishedAt || undefined,
      authors: post.author ? [post.author] : undefined,
      images: post.thumbImg ? [{ url: post.thumbImg, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription || undefined,
      images: post.thumbImg ? [post.thumbImg] : undefined,
    },
  };
}

async function fetchRelated(category?: string, excludeId?: number): Promise<BlogPost[]> {
  try {
    const url = `${SERVER_API_BASE}/blog?limit=3&isActive=true${category ? `&category=${encodeURIComponent(category)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data || []).filter((p: BlogPost) => p.id !== excludeId).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchBySlug<BlogPost>("/blog/by-slug", slug);
  if (!post) return notFound();

  const related = await fetchRelated(post.category, post.id);
  const tags = (post.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const articleSchemaData = articleSchema({
    title: post.h1Title || post.title,
    description: post.seoDescription || post.moreDescription || undefined,
    image: post.thumbImg || undefined,
    datePublished: post.publishedAt || undefined,
    author: post.author || undefined,
    url: `/blog/${post.slug}`,
  });
  const breadcrumbData = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <div className="bg-[#f8f8f8] min-h-screen pb-20">
      <JsonLd data={articleSchemaData} />
      <JsonLd data={breadcrumbData} />

      {/* ===== IMMERSIVE HERO ===== */}
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-end pb-16 pt-32 overflow-hidden bg-[#1C1C1C]">
        <img
          src={post.thumbImg || "/destinationImage/image/agra-6.webp"}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-105"
        />

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
          <div className="w-full py-8 md:py-12 flex flex-col items-center text-center">
            {post.category && (
              <span className="inline-block px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white bg-[#D4561A] rounded-full mb-6 shadow-md">
                {post.category}
              </span>
            )}
            {post.h1Title && (
              <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight drop-shadow-2xl [text-shadow:_0_4px_24px_rgb(0_0_0_/_0.8)] max-w-5xl">
                {post.h1Title}
              </h1>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/95 text-[15px] font-bold drop-shadow-lg [text-shadow:_0_2px_10px_rgb(0_0_0_/_0.8)]">
              {post.author && (
                <span className="inline-flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-full bg-[#2E8B8B] flex items-center justify-center text-white shadow-inner">
                    <User size={16} />
                  </span>
                  {post.author}
                </span>
              )}
              {post.publishedAt && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={18} className="text-white/60" /> {post.publishedAt}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT + SIDEBAR ===== */}
      <section className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-24 -mt-8 relative z-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px] lg:gap-16">
          <article className="min-w-0 bg-white rounded-3xl p-8 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 prose prose-lg prose-slate max-w-none">
            {post.seoDescription && <RichContent html={post.seoDescription} />}
            {post.moreDescription && (
              <div className="mt-12">
                <RichContent html={post.moreDescription} />
              </div>
            )}
          </article>

          <div className="mt-16 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar excludeId={post.id} tags={tags} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED POSTS ===== */}
      {related.length > 0 && (
        <section className="bg-white border-t border-slate-200/60 py-20">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-12">
              <span className="text-[#D4561A] font-black tracking-widest text-xs uppercase mb-3 block">More Reading</span>
              <h2 className="font-heading text-4xl font-extrabold text-[#1C1C1C]">Related Articles</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
