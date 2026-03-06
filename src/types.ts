export enum ConversationStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export enum UserPresence {
  AVAILABLE = 'available',
  AWAY = 'away',
  OFFLINE = 'offline',
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  active: boolean;
  notifications?: {
    newCall: boolean;
    closedCall: boolean;
    assignedToMe: boolean;
    participations: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  active: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'agent';
  timestamp: string;
  status?: MessageStatus;
  isInternal?: boolean;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerAvatar: string;
  assignedAgentId: string;
  organizationId: string;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}
