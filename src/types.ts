export interface Promotion {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface Gig {
  id: string;
  ownerId: string;
  ownerName?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  images: string[];
  createdAt?: string | number | Date;
}

export interface Seeker {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  location: string;
  rate: string;
  contactInfo: string;
  images: string[];
  createdAt?: string | number | Date;
  socialMedia?: string[];
  websiteUrl?: string[];
  videos?: string[];
}

export interface MarketItem {
  id: string;
  ownerId: string;
  ownerName?: string;
  title: string;
  description: string;
  price: string;
  location: string;
  images: string[];
  type?: 'selling' | 'wanted' | string;
  createdAt?: string | number | Date;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: string;
  status?: string;
  isRead: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  mediaUrls?: string[];
  mediaType?: string;
  likes?: string[];
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  unreadCount?: number;
  isBot?: boolean;
}
