import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import type { User } from "@/app/admin/types";
import { useEffect, useState } from "react";
import { socket } from "../../../socket"
import { manage }  from "../../../app/admin/index";

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

export default function UserListItem({ user, onViewProfile, currentRole }: UserListItemProps) {
  const [badgeLabel, setBadgeLabel] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModo, setIsModo] = useState(false);
  const [banned, setBanned] = useState(false);

  useEffect(() => {
    setIsAdmin(user.badges.includes("ADMIN"));
    setIsModo(user.badges.includes("MODERATOR"));
    setBanned(user.banned);
    setBadgeLabel([getBadgeLabel(user.badges)]);
  }, [user])

  async function banUser()
  {
    await manage.banUser(user.name);
    socket.emit("reviewed");
    socket.emit("banning", user.name);
    return ;
  }

  async function unbanUser()
  {
    await manage.unbanUser(user.name);
    socket.emit("unbanning");
    return ;
  }

  const changeRole = async (id: string, modo: boolean) =>
  {
    await manage.changeRole(id, modo);
    if (modo)
      socket.emit("removeMod", user.name);
    else
      socket.emit("addMod", user.name);
  }

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
          variant={isAdmin || currentRole !== "ADMIN" ? "secondary" : "primary"}
          className="h-8 px-3 text-xs"
          onClick={() => {
              if (isAdmin) return;
              if (currentRole === "ADMIN")
              {
                changeRole(user.id, isModo);
                setIsModo(!isModo);
              }
            }
          }
          title="Action de moderation pour admin"
        >
          {isAdmin ? "Admin" : currentRole !== "ADMIN" ? "Moderator" : isModo ? "demote moderator" : "Promote to moderator"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isAdmin || currentRole !== "ADMIN" ? "secondary" : "primary"}
          className="h-9 px-3 text-xs"
          onClick={() => {
              if (isAdmin || currentRole !== "ADMIN")
                return;
              if (banned)
                unbanUser()
              else
                banUser(); 
              setBanned(!banned);
            }
          }
          title="Ban"
        >
          {isAdmin ? "Admin" : currentRole !== "ADMIN" ? "Moderator" : !banned ? "Ban" : "Unban"}
        </Button>
      </div>
    </Card>
  );
}
