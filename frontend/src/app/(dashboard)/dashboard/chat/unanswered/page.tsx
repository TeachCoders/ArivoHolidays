"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import PageLoader from "@/components/shared/PageLoader";
import UnansweredReview from "@/feature/chat/components/UnansweredReview";

export default function UnansweredPage() {
  const { isSuperAdmin, isLoading } = usePermissions();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isSuperAdmin) {
      router.replace("/dashboard/chat");
    }
  }, [isLoading, isSuperAdmin, router]);

  if (isLoading || !isSuperAdmin) return <PageLoader size="sm" />;

  return <UnansweredReview />;
}
