import React from "react";
import FollowupClient from "@/feature/leadFollowup/components/FollowupClient";

export default function FollowupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <FollowupClient id={id} />;
}
