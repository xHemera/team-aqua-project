"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import IconButton from "@/components/atoms/IconButton";
import { socket } from "../../../socket"
import { contact }  from "../../../app/social/index"
import { authClient } from "@/lib/auth-client";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import Validate from "../Validate";
import { acceptFriendRequest } from "@/app/social/contact";


type Friends = {
  friendId:     string;
  userId:       string;
  request_sent: boolean;
  created_at:   Date;
}

type Messages = {
  id:         string;
  user_id:    string;
  inbox_id:   string;
  message:    string | null;
  createdAt:  Date;
}

type Inbox_users = {
	id:								string;
	inbox_id:					string;
	user_id:					string;
	unread_messages:	number | null;
};

type Inbox = {
  id: 								string;
  last_message: 			string | null;
  last_sent_user_id:  string | null;
  createdAt:  				Date;
  inboxUser:  				Inbox_users[];
	messages:					  Messages[];
};

type Avatar = {
  url:					string;
  id:						string;
  name:					string;
  type:					string;
  accent: 			string;
  accentHover:	string;
	users?:				any;
};

type User = {
  id:            			string;
  name:          			string;
  email:         			string;
  emailVerified:			Boolean;
  badges:             string[];
  blockedUsers:       string[];
  image:        			string | null;
  profileBackground:	string | null;
  profileBanner: 			string | null;
  createdAt:    			Date;
  updatedAt:    			Date;
  avatarId:      			string | null;
  avatar:        			Avatar | null;
  friends:       	    Friends[];
  inboxUser:     			Inbox_users[];
  messages:      	    Messages[];
  inbox:         			Inbox[];
};

type ProfileViewerModalProps = {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  pseudo?: string;
  avatarUrl?: string | null;
  badges?: string[];
  isFriend?: boolean;
  isBlocked?: boolean;
};

// Organism: modal d'apercu d'un profil avec actions sociales.
export default function ProfileViewerModal({
  open,
  onClose,
  user: inputUser = null,
  pseudo = "Joueur inconnu",
  avatarUrl = null,
  badges = [],
}: ProfileViewerModalProps) {
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [request, setRequest] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [friend, setFriend] = useState(false);
  const [isblocked, setIsBlocked] = useState(false);
  const [hasBlocked, setHasBlocked] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const [openValidate, setOpenValidate] = useState(false);

  //fetch the current user pseudo
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name)
        setUserPseudo(data.user.name);
    };
    getUserData();
  });

  //fetch users and their inboxes
  useEffect(() => {
    async function fetchUsers() {
    if (!userPseudo) return;
      const cU = await contact.getCurrentUser(userPseudo);
      setCurrentUser(cU);
    }
    fetchUsers();
  }, [userPseudo]);

  useEffect(() => {
    if (!currentUser || !inputUser) return;
    socket.on("received", async ({sender, receiver, msg}) => {
      {
        setNotifSender(sender);
        setNotification(msg);
        //await fetchUnread();
      }
    });

    //adds the request live
    socket.on("request", async ({user, oUser}) => {
      if (oUser == currentUser.name)
        setRequest(true);
    });

    //adds match button live
    socket.on("adding", async ({user, oUser}) => {
      if (user == inputUser.name)
      {
        setWaiting(false);
        setFriend(true);
      }
    });

    //resets status live
    socket.on("refusing", async ({user, oUser}) => {
      if (user == inputUser.name)
        setWaiting(false);
    });

    //sets blocked live
    socket.on("blocking", async ({user, oUser}) => {
      if (user == inputUser.name)
        setIsBlocked(true);
    });

    //resets status live
    socket.on("unblocking", async ({user, oUser}) => {
      if (user == inputUser.name)
        setIsBlocked(false);
    });
  }, [currentUser, inputUser]);

  //sets waiting status
  useEffect(() => {
    async function isWaiting()
    {
      if (!currentUser || !inputUser) return;
      const friend = await contact.getFriend(currentUser.name, inputUser.name);
      if (!friend) return;
      if (friend.request_sent == true) setWaiting(true);
      return;
    }
    isWaiting();
  }, [currentUser])

  //sets friend status
  useEffect(() => {
    async function isFriend()
    {
      if (!currentUser || !inputUser) return;
      const friend = await contact.getFriendFromOther(currentUser.name, inputUser.name);
      if (!friend) return;
      if (friend.request_sent == false) setFriend(true);
      return;
    }
    isFriend();
  }, [currentUser])

  //sets request status
  useEffect(() => {
    async function isRequesting()
    {
			//console.error("Before check: ", request);
      if (!currentUser || !inputUser) return;
      const friend = await contact.getFriendFromOther(currentUser.name, inputUser.name);
      if (!friend) return;
      if (friend.request_sent == true) setRequest(true);
			console.error("After check: ", request);
      return;
    }
    isRequesting();
  }, [currentUser])

  //sets blocked status
  useEffect(() => {
    async function isBlockedByMe()
    {
      if (!currentUser || !inputUser) return;
      for (const id of currentUser.blockedUsers)
      {
        if (id == inputUser.id)
          setHasBlocked(true);
      }
      return;
    }
    isBlockedByMe();
  }, [currentUser])

  //sets blocked status from user
  useEffect(() => {
    async function amIBlocked()
    {
      if (!currentUser || !inputUser) return;
      for (const id of inputUser.blockedUsers)
      {
        if (id == currentUser.id)
          setIsBlocked(true);
      }
      return;
    }
    amIBlocked();
  }, [currentUser])

  async function sendFriendRequest()
  {
    if (!currentUser || !inputUser) return;
    if (isblocked)
    {
      onClose();
      return;
    }
    contact.addFriend(currentUser.name, inputUser.name);
    socket.emit("friend_request", {
      user: currentUser.name,
      oUser: inputUser.name
    });
    setWaiting(true);
		setOpenValidate(false);
    onClose();
  }

  async function addFriend()
  {
    if (!currentUser || !inputUser) return;
    contact.acceptFriendRequest(currentUser.name, inputUser.name);
    socket.emit("friend_added", {
      user: currentUser.name,
      oUser: inputUser.name
    });
    setFriend(true);
    setRequest(false);
  }

  async function refuseFriendship()
  {
    if (!currentUser || !inputUser) return;
    contact.denyFriendRequest(currentUser.name, inputUser.name);
    socket.emit("friend_denied", {
      user: currentUser.name,
      oUser: inputUser.name
    });
    setRequest(false);
  }

  async function blockUser()
  {
    if (!currentUser || !inputUser) return;
    if (hasBlocked === false)
    {
      const oUser = await contact.getFriend(currentUser.name, inputUser.name);
      if (oUser)
        contact.blockFriend(currentUser.name, inputUser.name);
      else
        contact.blockUser(currentUser.name, inputUser.name);
      socket.emit("friend_or_user_blocked", {
        user: currentUser.name,
        oUser: inputUser.name
      });
      setHasBlocked(true);
    }
    else
    {
      contact.unblockUser(currentUser.name, inputUser.name);
      socket.emit("user_unblocked", {
        user: currentUser.name,
        oUser: inputUser.name
      });
      setHasBlocked(false);
    }
    onClose();
  }

  const displayedUser = inputUser;

  const displayedPseudo = displayedUser?.name ?? pseudo;
  const displayedAvatarUrl = displayedUser?.avatar?.url ?? displayedUser?.image ?? avatarUrl;
  const displayedBadges = displayedUser?.badges ?? badges;

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      {inputUser && showNotification && notification && notifSender && (notifSender !== inputUser.name) && (<NotificationToast onClose={() => setShowNotification(false)} msg={notification} sender={notifSender} />)}
      <Card
        className="w-full max-w-md rounded-2xl border border-[#3c3650] bg-[#15131d] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profileviewer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[color:var(--accent-border)] bg-[#242033]">
                {displayedAvatarUrl ? (
                  <Image
                    src={displayedAvatarUrl}
                    alt={`Avatar de ${displayedPseudo}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-black text-white">
                    {displayedPseudo.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 id="profileviewer-title" className="truncate text-xl font-black uppercase tracking-wide text-white">
                  {displayedPseudo}
                </h2>

                {displayedBadges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {displayedBadges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-[color:var(--accent-border)] bg-[var(--accent-color)]/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Validate
              open={request}
              title={"Do you accept this user's request ?"}
              onYes={() => {
                addFriend();
              }}
              onNo={() => refuseFriendship()}
            />
            <Button type="button" onClick={onClose} variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0">
              X
            </Button>
          </div>

          {/* Actions: message, ajouter en ami, bloquer */}
          <div className="flex items-center justify-center gap-4">
            <IconButton
              type="button"
              variant="secondary"
              size="lg"
              title="Envoyer un message"
              aria-label="Envoyer un message"
              onClick={onClose}
            >
              <i className="fa-regular fa-paper-plane text-lg" />
            </IconButton>

            <IconButton
              type="button"
              size="lg"
              title={friend ? "Deja ami" : "Ajouter en ami"}
              aria-label={friend ? "Deja ami" : "Ajouter en ami"}
              className={friend ? "border-emerald-500/70 bg-emerald-900/20 text-emerald-200" : undefined}
              onClick={() => setOpenValidate(true)}
            >
              <i className="fa-solid fa-user-plus text-lg" />
            </IconButton>
            <Validate
              open={openValidate}
              title={"Do you want to be friend with this user ?"}
              onYes={() => {
                if (!friend) {
                  sendFriendRequest();
                }
              }}
              onNo={() => {setOpenValidate(false); onClose;}}
            />
            <IconButton
              type="button"
              size="lg"
              title="Bloquer"
              aria-label="Bloquer"
              className="border-red-500/70 bg-red-900/20 text-red-200 hover:bg-red-900/35"
              onClick={() => blockUser()}
            >
              <i className="fa-solid fa-ban text-lg" />
            </IconButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
