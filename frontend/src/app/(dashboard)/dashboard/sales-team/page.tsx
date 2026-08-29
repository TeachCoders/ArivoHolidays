"use client";

import { useState } from "react";
import { Users, ChevronRight, User2, Mail, Phone, Briefcase } from "lucide-react";
import Link from "next/link";
import { useGetTeam } from "@/feature/teams/api/useTeam";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import PageLoader from "@/components/shared/PageLoader";
import StatsCardGrid from "@/components/shared/StatsCardGrid";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";

export default function SalesTeamPage() {
  const { teams = [], isLoading } = useGetTeam();
  const { user } = useGetCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");

  // Find Sales team
  const salesTeam = teams.find((t: any) =>
    t.name?.toLowerCase() === "sales"
  );

  const members = (salesTeam?.users || []).filter((m: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.mobile?.includes(q)
    );
  });

  if (isLoading) {
    return <PageLoader size="section" text="Loading..." />;
  }

  return (
    <div className="space-y-6">
      <PrivatePageHeading
        icon={Users}
        title="Sales Member List"
        description="All members of the Sales team and their lead assignments"
      />

      {/* Stats */}
      <StatsCardGrid
        items={[
          { label: "Total Members", value: salesTeam?.users?.length || 0, icon: Users },
          { label: "Active Members", value: salesTeam?.users?.filter((u: any) => u.isActive).length || 0, icon: User2 },
          { label: "Inactive Members", value: salesTeam?.users?.filter((u: any) => !u.isActive).length || 0, icon: User2 },
        ]}
        columns={3}
        size="lg"
      />

      <FilterBox
        search={{ value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by name, email, phone..." }}
      />

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-neutral-border">
          <h3 className="font-bold text-brand-neutral-dark text-sm">Sales Team Members</h3>
        </div>
        {!salesTeam ? (
          <div className="p-12 text-center">
            <Users size={28} className="text-brand-neutral-muted mx-auto mb-3" />
            <p className="text-brand-neutral-muted text-sm">Sales team not found.</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={28} className="text-brand-neutral-muted mx-auto mb-3" />
            <p className="text-brand-neutral-muted text-sm">No members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                  <th className="tbl-th">Member</th>
                  <th className="tbl-th">Contact</th>
                  <th className="tbl-th">Role</th>
                  <th className="tbl-th">Status</th>
                  <th className="tbl-th-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-light">
                {members.map((member: any) => {
                  const imageSrc = member.profileImage;
                  const src = imageSrc
                    ? (imageSrc.startsWith("http") || imageSrc.startsWith("data:") ? imageSrc : `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${imageSrc}`)
                    : null;

                  return (
                    <tr key={member.id} className="hover:bg-brand-neutral-light/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {src ? (
                            <img
                              src={src}
                              alt={member.name}
                              className="w-9 h-9 rounded-full object-cover border border-brand-neutral-border shadow-sm shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "User")}&background=random`;
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-900 shrink-0 font-bold text-xs">
                              {member.name ? member.name.charAt(0).toUpperCase() : <User2 size={14} />}
                            </div>
                          )}
                          <span className="font-semibold text-brand-neutral-dark">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-brand-neutral flex items-center gap-1"><Mail size={11} /> {member.email}</p>
                        {member.mobile && <p className="text-xs text-brand-neutral-muted flex items-center gap-1 mt-0.5"><Phone size={11} /> {member.mobile}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold capitalize">
                          {member.role?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${member.isActive ? "bg-brand-success-light text-brand-success" : "bg-brand-danger-light text-brand-danger"}`}>
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/teams/${member.id}`}
                            className="text-[11px] font-medium bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition inline-flex items-center gap-1"
                          >
                            <Briefcase size={11} /> View Leads <ChevronRight size={11} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
