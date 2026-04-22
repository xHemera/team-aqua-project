"use client";

import { useEffect, useMemo, useState } from "react";
import AppPageShell from "@/components/AppPageShell";
import UsersManagementPanel from "@/components/organisms/admin/UsersManagementPanel";
import ReportedConversationsPanel from "@/components/organisms/admin/ReportedConversationsPanel";
import type { type } from "./index";
import { manage }  from "./index"

export default function AdminPage() {

  const [users, setUsers] = useState<type.User[]>([]);
  const [reports, setReports] = useState<type.ReportedConv[]>([]);

  const loadingUsers = false;
  const usersError = null;
  const loadingReports = false;
  const reportsError = null;

  const [userQuery, setUserQuery] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");

  useEffect(() => {
    async function fetchUsersAndReports()
    {
      const [u, r] = await Promise.all([
            manage.getUsers(),
            manage.getReports(),
      ])
      setUsers(u);
      if (!r)
        setReports([])
      else
        setReports(r);
    }
    fetchUsersAndReports();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = userQuery.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) => {
      const inPseudo = user.name.toLowerCase().includes(normalizedQuery);
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
          pendingReportsCount={reports.filter.length}
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
