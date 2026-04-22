export type User = {
  id:     string;
  name:   string;
  badges: string[];
  banned: boolean;
  avatar?: string | null
};

export type Message = {
  id: string;
  user_id: string;
  message: string | null;
  createdAt: Date;
};

export type ReportedConv = {
  id:           string;
  reportedUser: string;
  reporter:     string;
  reason:       string;
  createdAt:    Date;
  inbox:        Inbox;
  inboxId:      string;
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
  messages: Message[];
  last_message:  string | null;
};

export type SocialMessage = {
  id: string;
  user_id: string;
  message: string | null;
  createdAt: string | Date;
};