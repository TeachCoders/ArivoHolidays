"use client";

import { useState, useMemo } from "react";
import FormActionButton from "@/components/shared/customBtns";
import { ReusableModel } from "@/components/shared/reusableModel";
import { Badge } from "@/components/ui/badge";
import { User2, ChevronRight, Users, Mail, Phone, Shield, UserPlus, Globe, Compass, UsersRound, UserCheck, UserX, Plus, Search } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import Link from "next/link";
import ReusableTable, { Column } from "@/components/shared/ReusableTable";
import { useGetTeam } from "@/feature/teams/api/useTeam";
import { TeamForm } from "@/feature/teams/components/teamForm";
import { UserForm } from "@/components/shared/forms/userForm";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";

type Member = {
  name: string;
  role: string;
};

type Team = {
  id: number;
  name: string;
  description: string;
  status: string;
  created: string;
  isActive?: boolean;
  color?: string;
  short?: string;
  members?: Member[];
  users?: any[];
};

const TEAM_COLORS: Record<string, string> = {
  "sales": "#023f67",
  "operations": "#58a2ad",
  "support": "#fea886",
  "it maintenance": "#6366f1",
};

export default function Teams() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedTeamIdForUser, setSelectedTeamIdForUser] = useState<number | null>(null);
  const [selectedTeamNameForUser, setSelectedTeamNameForUser] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { teams: allTeams = [], isLoading } = useGetTeam();
  const allFiltered = allTeams.filter((t: any) => !t.name?.toLowerCase().includes("vendor"));
  const teams = useMemo(() => {
    if (!search.trim()) return allFiltered;
    const q = search.toLowerCase();
    return allFiltered.filter((t: any) => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
  }, [allFiltered, search]);
  const { user } = useGetCurrentUser();

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");

  const totalMembers = useMemo(() => allFiltered.reduce((sum: number, t: any) => sum + (t.users?.length || 0), 0), [allFiltered]);
  const activeTeams = useMemo(() => allFiltered.filter((t: any) => t.isActive !== false).length, [allFiltered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading teams...</p>
        </div>
      </div>
    );
  }

  const columns: Column<Team>[] = [
    {
      header: "Team",
      accessor: (team) => {
        const color = TEAM_COLORS[team.name?.toLowerCase()] || team.color || "#023f67";
        const memberCount = team.users?.length || 0;
        return (
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm shadow-lg"
              style={{ backgroundColor: color }}
            >
              {team.short || team.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{team.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
        );
      },
      className: "w-[280px]",
    },
    {
      header: "Description",
      accessor: (team) => (
        <p className="text-sm text-gray-500 line-clamp-2 max-w-xs">{team.description || "No description"}</p>
      ),
    },
    {
      header: "Status",
      accessor: (team) => {
        const isActive = team.status === "TEAM ACTIVE" || team.isActive !== false;
        return (
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-full ${
            isActive
              ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
              : "bg-orange-50 text-orange-500 ring-1 ring-orange-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-orange-400"}`} />
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessor: (team) => (
        <div className="text-center">
          <button
            onClick={() => {
              setEditingTeam(team);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Manage
          </button>
        </div>
      ),
      className: "text-center",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PrivatePageHeading
          icon={Users}
          title="Team Management"
          description="Organize your workforce into teams, assign roles, and manage members across your travel business."
        />
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingTeam(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-brand-navy font-bold text-sm rounded-xl hover:bg-brand-gold/90 transition-all duration-200 shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/30 hover:scale-[1.02]"
          >
            <Plus size={16} strokeWidth={2.5} /> Create Team
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-colors">
              <UsersRound size={22} className="text-brand-navy group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-800">{allFiltered.length}</p>
              <p className="text-xs text-gray-400 font-medium">Total Teams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal transition-colors">
              <UserCheck size={22} className="text-brand-teal group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-800">{totalMembers}</p>
              <p className="text-xs text-gray-400 font-medium">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
              <UserX size={22} className="text-emerald-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-800">{activeTeams}</p>
              <p className="text-xs text-gray-400 font-medium">Active Teams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-800 text-sm">All Teams</h2>
            <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">{teams.length}</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all w-56"
            />
          </div>
        </div>

        <ReusableTable
          columns={columns}
          data={teams}
          expandable
          getRowId={(team) => team.id}
          renderExpandedRow={(team) => {
            const membersToDisplay = team.users || team.members || [];
            return (
            <div className="p-5 bg-white">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <Users size={16} className="text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{team.name} Members</h3>
                    <p className="text-[11px] text-gray-400">{membersToDisplay.length} member{membersToDisplay.length !== 1 ? "s" : ""} assigned</p>
                  </div>
                </div>
                {isSuperAdmin && (
                  <FormActionButton
                    text="Add Member"
                    size="sm"
                    onClick={() => {
                      setSelectedTeamIdForUser(team.id);
                      setSelectedTeamNameForUser(team.name);
                      setIsUserModalOpen(true);
                    }}
                  />
                )}
              </div>

              {membersToDisplay.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-navy/10 to-brand-teal/10 flex items-center justify-center mb-4">
                    <UserPlus size={28} className="text-brand-primary/50" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">No members yet</p>
                  <p className="text-xs text-gray-400 mb-5">Add team members to get started</p>
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        setSelectedTeamIdForUser(team.id);
                        setSelectedTeamNameForUser(team.name);
                        setIsUserModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-navy text-white text-xs font-bold rounded-xl hover:bg-brand-navy/90 transition-all shadow-lg shadow-brand-navy/20 hover:shadow-brand-navy/30 hover:scale-[1.02]"
                    >
                      <UserPlus size={14} /> Add First Member
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {membersToDisplay.map((member: any, index: number) => {
                    const imageSrc = member.profileImage;
                    const src = imageSrc
                      ? (imageSrc.startsWith("http") || imageSrc.startsWith("data:") ? imageSrc : `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${imageSrc}`)
                      : null;

                    return (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-brand-primary/30 hover:shadow-md transition-all duration-200 group">
                        <div className="flex items-center gap-4">
                          {src ? (
                            <img
                              src={src}
                              alt={member.name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "User")}&background=58a2ad&color=fff&bold=true`;
                              }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-teal/20 flex items-center justify-center ring-1 ring-brand-primary/10">
                              <span className="text-sm font-bold text-brand-primary">
                                {member.name ? member.name.charAt(0).toUpperCase() : <User2 size={16} />}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{member.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Mail size={10} /> {member.email}
                              </span>
                              {member.mobile && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                  <Phone size={10} /> {member.mobile}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full font-semibold capitalize">
                            <Shield size={10} /> {member.role?.replace(/_/g, " ")}
                          </span>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${member.isActive ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" : "bg-red-50 text-red-500 ring-1 ring-red-200"}`}>
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/dashboard/teams/${member.id}`}
                              className="text-[10px] font-semibold bg-brand-primary text-white px-3 py-1.5 rounded-lg hover:bg-brand-primary/90 transition inline-flex items-center gap-1 shadow-sm"
                            >
                              View <ChevronRight size={11} />
                            </Link>
                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  setEditingUser(member);
                                  setIsEditUserModalOpen(true);
                                }}
                                className="text-[10px] font-semibold text-gray-500 hover:text-brand-primary px-2.5 py-1.5 rounded-lg hover:bg-brand-primary/5 transition border border-gray-200 hover:border-brand-primary/30"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          }}
          pagination={{
            currentPage,
            totalPages: Math.ceil(teams.length / itemsPerPage),
            onPageChange: setCurrentPage,
            pageSize: itemsPerPage,
            onPageSizeChange: (size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            },
          }}
        />
      </div>

      {/* Modals */}
      <ReusableModel
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
        title="Create New Member"
        description="Add a new user to the selected team."
        contentClassName="sm:max-w-[600px] md:max-w-[800px]"
      >
        <div className="py-2 max-h-[75vh] overflow-y-auto px-1">
          <UserForm teamId={selectedTeamIdForUser} teamName={selectedTeamNameForUser || undefined} onSuccess={() => setIsUserModalOpen(false)} />
        </div>
      </ReusableModel>

      <ReusableModel
        open={isEditUserModalOpen}
        onOpenChange={(open) => {
          setIsEditUserModalOpen(open);
          if (!open) setEditingUser(null);
        }}
        title="Update Member"
        description="Update the details of the selected member."
        contentClassName="sm:max-w-[800px] max-w-[80vw]"
      >
        <div className="py-2">
          <UserForm
            initialData={editingUser}
            onSuccess={() => {
              setIsEditUserModalOpen(false);
              setEditingUser(null);
            }}
          />
        </div>
      </ReusableModel>

      <ReusableModel
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingTeam(null);
        }}
        title={editingTeam ? "Update Team" : "Create New Team"}
        description={editingTeam ? "Update the details of the selected team." : "Fill out the details below to create a new team."}
      >
        <div className="py-2">
          <TeamForm
            initialData={editingTeam}
            onSuccess={() => {
              setIsModalOpen(false);
              setEditingTeam(null);
            }}
          />
        </div>
      </ReusableModel>
    </div>
  );
}
