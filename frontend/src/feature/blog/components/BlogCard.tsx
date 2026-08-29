import Link from "next/link";
import { CalendarDays, User, ArrowRight } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import type { BlogPost } from "@/feature/blog/type";

const FALLBACK_IMAGE = "/destinationImage/image/agra-6.webp";

export default function BlogCard({ post }: { post: BlogPost }) {
  const excerpt = stripHtml(post.seoDescription || "").slice(0, 110);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out h-full"
    >
      <div className="relative h-[240px] overflow-hidden bg-slate-100 shrink-0">
        <img
          src={post.thumbImg || FALLBACK_IMAGE}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Solid Overlay */}
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-500 group-hover:bg-black/40" />

        {post.category && (
          <span className="absolute top-4 left-4 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#1C1C1C] bg-white rounded-full shadow-lg pointer-events-auto">
            {post.category}
          </span>
        )}

        {/* Floating Meta at bottom of image */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 text-xs font-semibold text-white/95">
          {post.author && (
            <span className="inline-flex items-center gap-1.5 drop-shadow-md">
              <User size={13} className="text-white/80" /> {post.author}
            </span>
          )}
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1.5 drop-shadow-md">
              <CalendarDays size={13} className="text-white/80" /> {post.publishedAt}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 bg-white relative z-10">
        <h3 className="text-[18px] font-bold text-[#1C1C1C] leading-snug group-hover:text-[#2E8B8B] transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="mt-3 text-[14px] text-[#666] leading-relaxed line-clamp-3 flex-1">
          {excerpt}...
        </p>

        <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#D4561A]">
            Read Article
          </span>
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 group-hover:bg-[#D4561A] group-hover:border-[#D4561A] group-hover:shadow-md transition-all duration-300">
            <ArrowRight size={15} className="text-[#D4561A] group-hover:text-white transition-all duration-300 group-hover:-rotate-45" />
          </div>
        </div>
      </div>
    </Link>
  );
}
