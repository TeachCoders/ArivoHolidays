import { notFound } from "next/navigation";
import CmsPageDetail from "./CmsPageDetail";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema } from "@/lib/jsonLd";
import { fetchBySlug } from "@/feature/destinations/api/public-server";
import type { CmsPage } from "@/feature/cms/type";

export default async function CmsFallbackPage({ slug }: { slug: string }) {
  const page = await fetchBySlug<CmsPage>("/cms/by-slug", slug);
  if (!page) return notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: page.title, path: `/${page.slug}` },
        ])}
      />
      <CmsPageDetail page={page} />
    </>
  );
}
