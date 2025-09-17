export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  createdAt: string;
  mediaUrl?: string;
}

export interface Chat {
  _id: string;
  isGroupChat: boolean;
  chatName: string;
  users: User[];
  latestMessage?: Message;
}
