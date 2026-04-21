export type User = {
  id:     string;
  name:   string;
  badges: string[];
  banned: boolean;
  avatar?: string | null
};

export type ReportedConversationMessage = {
  id: string;
  sender: string;
  content: string;
  time: string;
  mine?: boolean;
};

export type ReportedConversation = {
  id: string;
  reporter: string;
  targetUser: string;
  reason: string;
  status: "pending" | "reviewed";
  createdAtLabel: string;
  preview: string;
  messages: ReportedConversationMessage[];
};

export type SocialUser = {
  id: string;
  name: string;
  badges: string[];
  avatar?: {
    url?: string | null;
  } | null;
};

export type InboxUser = {
  user_id: string;
  unread_messages: number | null;
};

export type Inbox = {
  id: string;
  inboxUser: InboxUser[];
};

export type SocialMessage = {
  id: string;
  user_id: string;
  message: string | null;
  createdAt: string | Date;
};