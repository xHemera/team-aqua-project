export type Messages = {
  id:         string;
  user_id:    string;
  inbox_id:   string;
  message:    string | null;
  createdAt:  Date;
  attachments: Attachment[]
}

export type Inbox_users = {
	id:								string;
	inbox_id:					string;
	user_id:					string;
	unread_messages:	number | null;
};

export type Inbox = {
  id: 								string;
  inboxUser:  				Inbox_users[];
};

export type Avatar = {
  url:					string;
};

export type Friend = {
  userId: string;
  friendId: string;
  request_sent: boolean;
  created_at: Date;
}

export type User = {
  id:           string;
  name:         string;
  badges:       string[];
  blockedUsers: string[];
  avatar:       Avatar | null;
  image:        string | null;
  online:       boolean;
};

export type Attachment = {
  id: 				string;
  name: 			string;
  sizeLabel:	string;
  type: 			string;
  previewUrl: string;
};

export type InviteNotification = {
  type: "success" | "error";
  message: string;
};