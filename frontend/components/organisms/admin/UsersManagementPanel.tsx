import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import UserListItem from "@/components/molecules/admin/UserListItem";
import type { User } from "@/app/admin/types";
import { useRouter } from "next/navigation";

type UsersManagementPanelProps = {
  users: User[];
  filteredUsers: User[];
  loadingUsers: boolean;
  usersError: string | null;
  userQuery: string;
  onUserQueryChange: (value: string) => void;
  pendingReportsCount: number;
};

export default function UsersManagementPanel({
  users,
  filteredUsers,
  loadingUsers,
  usersError,
  userQuery,
  onUserQueryChange,
  pendingReportsCount,
}: UsersManagementPanelProps) {
  const router = useRouter();

  function onViewProfile(user: string)
  {
    router.push(`/profile/${user}`)
  }

  return (
    <Card className="flex min-h-0 w-full flex-col p-4 lg:w-[56%] lg:p-5">
      <div className="flex items-center justify-between gap-3 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Admin panel</p>
          <h1 className="text-2xl font-bold text-white">Users Management</h1>
        </div>

        <span className="rounded-full border border-[color:var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-white">
          {users.length} accounts
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="rounded-xl bg-[#1c1827] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-400">Total users</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{users.length}</p>
        </Card>

        <Card className="rounded-xl bg-[#1c1827] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-400">Admins</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {users.filter((user) => user.badges.includes("ADMIN")).length}
          </p>
        </Card>

        <Card className="rounded-xl bg-[#1c1827] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-400">Reports</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{pendingReportsCount}</p>
        </Card>
      </div>

      <div className="mb-3">
        <Input
          value={userQuery}
          onChange={(event) => onUserQueryChange(event.target.value)}
          placeholder="Search for a user, badge..."
          aria-label="Search for a user"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {loadingUsers && (
          <Card className="rounded-xl bg-[#1c1827] p-4 text-sm text-gray-300">Loading users...</Card>
        )}

        {!loadingUsers && usersError && (
          <Card className="rounded-xl border-red-400/50 bg-red-900/20 p-4 text-sm text-red-100">{usersError}</Card>
        )}

        {!loadingUsers && !usersError && filteredUsers.length === 0 && (
          <Card className="rounded-xl bg-[#1c1827] p-4 text-sm text-gray-300">
            No users match this search.
          </Card>
        )}

        {!loadingUsers && !usersError && filteredUsers.length > 0 && (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <UserListItem key={user.id} user={user} onViewProfile={onViewProfile} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
