export type SplitType = "equal" | "unequal" | "percentage" | "share";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  createdAt: string;
  memberCount: number;
  balance?: {
    owes: number;
    owed: number;
  };
}

export interface GroupMemberSummary {
  id: string;
  userId: string;
  name: string;
  email: string;
}

export interface ExpenseSummary {
  id: string;
  title: string;
  amount: number;
  paidById: string;
  paidByName: string;
  splitType: string;
  createdAt: string;
}

export interface ExpenseSplitSummary {
  id: string;
  userId: string;
  userName: string;
  amount: number;
}

export interface MessageSummary {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface BalanceSummary {
  userId: string;
  userName: string;
  balance: number;
}

export interface SplitInput {
  userId: string;
  value: number;
}

export interface CreateExpensePayload {
  title: string;
  amount: number;
  paidById: string;
  splitType: SplitType;
  splits: SplitInput[];
}

export interface NotificationSummary {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversationSummary {
  id: string;
  participant: UserSummary;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export interface ChatMessageSummary {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
