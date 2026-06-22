import { Promotion, UserNotification } from '../types';

export const storage = {
  getNotifications: async (): Promise<UserNotification[]> => {
    try {
      const res = await fetch('/api/notifications');
      return await res.json();
    } catch (err) {
      console.error('Failed to get notifications', err);
      return [];
    }
  },
  
  saveNotification: async (notification: UserNotification) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (err) {
      console.error('Failed to save notification', err);
    }
  },
  
  markAsRead: async (id: string) => {
    try {
      const notifications = await storage.getNotifications();
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        await fetch(`/api/notifications/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...notification, read: true })
        });
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  },

  getPromotions: async (): Promise<Promotion[]> => {
    try {
      const res = await fetch('/api/promotions');
      return await res.json();
    } catch (err) {
      console.error('Failed to get promotions', err);
      return [];
    }
  },

  savePromotion: async (promotion: Promotion) => {
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotion)
      });
      const saved = await res.json();
      
      // Auto-generate notification for the user when a promotion is created
      const notification: UserNotification = {
        id: `notif-${saved.id || Math.random().toString(36).substring(7)}`,
        title: 'New Promotion!',
        message: `${saved.title}: ${saved.description}`,
        timestamp: Date.now(),
        read: false
      };
      await storage.saveNotification(notification);
    } catch (err) {
      console.error('Failed to save promotion', err);
    }
  }
};
