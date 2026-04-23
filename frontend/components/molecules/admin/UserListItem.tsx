import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import type { User } from "@/app/admin/types";
import { useEffect, useState } from "react";
import { socket } from "../../../socket"

type UserListItemProps = {
  user: User;
  onViewProfile: (pseudo: string) => void;
  currentRole: string;
};

const getBadgeLabel = (badges: string[]) => {
  if (badges.includes("ADMIN")) return "Admin";
  if (badges.includes("MODERATOR")) return "Moderator";
  if (badges.length > 0) return badges[0];
  return "User";
};

const changeRole = async (id: string, modo: boolean) =>
{
  const response = await fetch('api/admin/role', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({user: id, isModo: modo})
  });
  if (!response.ok) {
    throw new Error("Impossible de modifier les badges");
  }
  if (modo)
    socket.emit("removeMod");
  else
    socket.emit("newMod");
}

export default function UserListItem({ user, onViewProfile, currentRole }: UserListItemProps) {
  const [badgeLabel, setBadgeLabel] = useState<string[]>([getBadgeLabel(user.badges)]);
  const [isAdmin, setIsAdmin] = useState(user.badges.includes("ADMIN"))
  const [isModo, setIsModo] = useState(user.badges.includes("MODERATOR"))

  return (
    <Card className="flex items-center justify-between gap-3 rounded-xl bg-[#1c1827] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#3c3650] bg-[#242033]">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <i className="fa-regular fa-user text-lg text-gray-400" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-gray-400">{badgeLabel}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-3 text-xs"
          onClick={() => onViewProfile(user.name)}
        >
          See profile
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isAdmin ? "secondary" : "primary"}
          className="h-8 px-3 text-xs"
          onClick={() => {!isAdmin && currentRole === "ADMIN" && changeRole(user.id, isModo); currentRole === "ADMIN" && setIsModo(!isModo)}}
          title="Action de moderation pour admin"
        >
          {isAdmin ? "Admin" : isModo ? "demote moderator" : "Promote to moderator"}
        </Button>
      </div>
    </Card>
  );
}
