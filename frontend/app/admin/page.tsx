"use client";

import { useMemo, useState } from "react";
import AppPageShell from "@/components/AppPageShell";
import UsersManagementPanel from "@/components/organisms/admin/UsersManagementPanel";
import ReportedConversationsPanel from "@/components/organisms/admin/ReportedConversationsPanel";
import type { AdminUser, ReportedConversation } from "./types";

const formatDateLabel = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const HARD_CODED_USERS: AdminUser[] = [
  {
    id: "usr-1",
    pseudo: "Xoco",
    avatar: "/profile-icons/default.svg",
    badges: ["ADMIN"],
  },
  {
    id: "usr-2",
    pseudo: "Hemera",
    avatar: "/profile-icons/default.svg",
    badges: ["ADMIN"],
  },
  {
    id: "usr-3",
    pseudo: "LunaDeck",
    avatar: null,
    badges: ["MOD"],
  },
  {
    id: "usr-4",
    pseudo: "NightPulse",
    avatar: null,
    badges: [],
  },
  {
    id: "usr-5",
    pseudo: "KantoFox",
    avatar: null,
    badges: [],
  },
];

const HARD_CODED_REPORTS: ReportedConversation[] = [
  {
    id: "rpt-001",
    reporter: "KantoFox",
    targetUser: "NightPulse",
    reason: "Insultes repetees",
    status: "pending",
    createdAtLabel: formatDateLabel("2026-04-17T14:12:00Z"),
    preview: "Tu es nul, desinstalle le jeu.",
    messages: [
      {
        id: "msg-1",
        sender: "KantoFox",
        content: "Salut, tu peux eviter les insultes ?",
        time: formatTime("2026-04-17T14:09:00Z"),
      },
      {
        id: "msg-2",
        sender: "NightPulse",
        content: "Tu es nul, desinstalle le jeu.",
        time: formatTime("2026-04-17T14:10:00Z"),
        mine: true,
      },
      {
        id: "msg-3",
        sender: "NightPulse",
        content: "On ne veut pas de toi ici.",
        time: formatTime("2026-04-17T14:11:00Z"),
        mine: true,
      },
    ],
  },
  {
    id: "rpt-002",
    reporter: "LunaDeck",
    targetUser: "ShadowMew",
    reason: "Spam",
    status: "reviewed",
    createdAtLabel: formatDateLabel("2026-04-16T22:41:00Z"),
    preview: "??????????????????",
    messages: [
      {
        id: "msg-4",
        sender: "LunaDeck",
        content: "Stop le spam stp.",
        time: formatTime("2026-04-16T22:38:00Z"),
      },
      {
        id: "msg-5",
        sender: "ShadowMew",
        content: "??????????????????",
        time: formatTime("2026-04-16T22:39:00Z"),
        mine: true,
      },
      {
        id: "msg-6",
        sender: "ShadowMew",
        content: "??????????????????",
        time: formatTime("2026-04-16T22:40:00Z"),
        mine: true,
      },
    ],
  },
  {
    id: "rpt-003",
    reporter: "EeveeFan",
    targetUser: "StoneTrainer",
    reason: "Comportement toxique",
    status: "pending",
    createdAtLabel: formatDateLabel("2026-04-15T09:17:00Z"),
    preview: "Tu n'as aucun niveau.",
    messages: [
      {
        id: "msg-7",
        sender: "StoneTrainer",
        content: "Tu n'as aucun niveau.",
        time: formatTime("2026-04-15T09:16:00Z"),
        mine: true,
      },
      {
        id: "msg-8",
        sender: "EeveeFan",
        content: "Merci de rester respectueux.",
        time: formatTime("2026-04-15T09:17:00Z"),
      },
    ],
  },
];

export default function AdminPage() {
  const users = HARD_CODED_USERS;
  const reports = HARD_CODED_REPORTS;

  const loadingUsers = false;
  const usersError = null;
  const loadingReports = false;
  const reportsError = null;

  const [userQuery, setUserQuery] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(HARD_CODED_REPORTS[0]?.id ?? "");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = userQuery.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) => {
      const inPseudo = user.pseudo.toLowerCase().includes(normalizedQuery);
      const inBadges = user.badges.join(" ").toLowerCase().includes(normalizedQuery);
      return inPseudo || inBadges;
    });
  }, [userQuery, users]);

  return (
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1">
      <div className="flex min-h-0 w-full flex-col gap-4 lg:flex-row">
        <UsersManagementPanel
          users={users}
          filteredUsers={filteredUsers}
          loadingUsers={loadingUsers}
          usersError={usersError}
          userQuery={userQuery}
          onUserQueryChange={setUserQuery}
          onViewProfile={() => {}}
          pendingReportsCount={reports.filter((report) => report.status === "pending").length}
        />

        <ReportedConversationsPanel
          reports={reports}
          loadingReports={loadingReports}
          reportsError={reportsError}
          selectedReportId={selectedReportId}
          onSelectReportId={setSelectedReportId}
        />
      </div>
    </AppPageShell>
  );
}
