import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import type { User } from "@/app/admin/types";

type UserListItemProps = {
  user: User;
  onViewProfile: (pseudo: string) => void;
};

const getBadgeLabel = (badges: string[]) => {
  if (badges.includes("ADMIN")) return "Admin";
  if (badges.includes("MODERATOR")) return "Moderator";
  if (badges.length > 0) return badges[0];
  return "User";
};

export default function UserListItem({ user, onViewProfile }: UserListItemProps) {
  const badgeLabel = getBadgeLabel(user.badges);
  const isAdmin = user.badges.includes("ADMIN");
  const isModo = user.badges.includes("MODERATOR");

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
          Voir profil
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isAdmin ? "secondary" : "primary"}
          className="h-8 px-3 text-xs"
          onClick={() => {!isAdmin}}
          title="Action de moderation a connecter a une API admin"
        >
          {isAdmin ? "is admin" : isModo ? "demote moderator" : "Promote to moderator"}
        </Button>
      </div>
    </Card>
  );
}
