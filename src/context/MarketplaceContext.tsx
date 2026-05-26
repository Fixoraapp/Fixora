import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { UserRole } from '../types/navigation';

export type OrderStatus = 'pending' | 'accepted' | 'master_on_way' | 'in_progress' | 'completed' | 'cancelled';
export type MessageKind = 'text' | 'image' | 'voice';

export type MarketplaceOrder = {
  id: string;
  clientName: string;
  masterName: string;
  serviceTitle: string;
  city: string;
  district: string;
  price: string;
  time: string;
  distance: string;
  status: OrderStatus;
  createdAt: string;
  unreadForClient: number;
  unreadForMaster: number;
  review?: {
    rating: number;
    text: string;
    photoAttached: boolean;
  };
};

export type ChatMessage = {
  id: string;
  orderId: string;
  sender: UserRole;
  text: string;
  timestamp: string;
  kind: MessageKind;
};

export type MarketplaceNotification = {
  id: string;
  role: UserRole;
  title: string;
  body: string;
  category: 'order' | 'message' | 'review' | 'payout';
  unread: boolean;
  time: string;
};

type CreateOrderInput = {
  masterName: string;
  serviceTitle: string;
  city: string;
  district: string;
  price: string;
};

type MarketplaceContextValue = {
  orders: MarketplaceOrder[];
  messages: ChatMessage[];
  notifications: MarketplaceNotification[];
  createOrder: (input: CreateOrderInput) => MarketplaceOrder;
  acceptOrder: (orderId: string) => void;
  declineOrder: (orderId: string) => void;
  startOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  sendMessage: (orderId: string, sender: UserRole, text: string, kind?: MessageKind) => void;
  submitReview: (orderId: string, rating: number, text: string, photoAttached: boolean) => void;
  markNotificationsRead: (role: UserRole) => void;
};

const initialOrders: MarketplaceOrder[] = [
  {
    id: 'm1',
    clientName: 'Mariam K.',
    masterName: 'Fixora Master',
    serviceTitle: 'Socket installation',
    city: 'Yerevan',
    district: 'Kentron',
    price: '8,000 AMD',
    time: 'Today, 14:30',
    distance: '1.3 km',
    status: 'pending',
    createdAt: '09:42',
    unreadForClient: 0,
    unreadForMaster: 1,
  },
  {
    id: 'm2',
    clientName: 'Artem S.',
    masterName: 'Fixora Master',
    serviceTitle: 'Wiring repair',
    city: 'Yerevan',
    district: 'Arabkir',
    price: '18,000 AMD',
    time: 'Today, 16:00',
    distance: '2.1 km',
    status: 'pending',
    createdAt: '10:05',
    unreadForClient: 0,
    unreadForMaster: 1,
  },
  {
    id: 'm3',
    clientName: 'Georg M.',
    masterName: 'Fixora Master',
    serviceTitle: 'Apartment wiring replacement',
    city: 'Yerevan',
    district: 'Ajapnyak',
    price: '25,000 AMD',
    time: 'Tomorrow, 10:00',
    distance: '3.4 km',
    status: 'in_progress',
    createdAt: 'Yesterday',
    unreadForClient: 0,
    unreadForMaster: 0,
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: 'msg-m3-1',
    orderId: 'm3',
    sender: 'client',
    text: 'Hi, can we confirm the wiring replacement details?',
    timestamp: '10:12',
    kind: 'text',
  },
  {
    id: 'msg-m3-2',
    orderId: 'm3',
    sender: 'master',
    text: 'Yes. I will bring the materials and start with diagnostics.',
    timestamp: '10:14',
    kind: 'text',
  },
];

const initialNotifications: MarketplaceNotification[] = [
  {
    id: 'n1',
    role: 'master',
    title: 'New nearby order',
    body: 'Socket installation in Kentron is waiting for your response.',
    category: 'order',
    unread: true,
    time: 'Now',
  },
  {
    id: 'n2',
    role: 'master',
    title: 'Payout scheduled',
    body: 'Your next payout is prepared for today evening.',
    category: 'payout',
    unread: false,
    time: '08:30',
  },
];

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<MarketplaceOrder[]>(initialOrders);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>(initialNotifications);

  const addNotification = (role: UserRole, title: string, body: string, category: MarketplaceNotification['category']) => {
    setNotifications((items) => [
      { id: nextId('ntf'), role, title, body, category, unread: true, time: nowLabel() },
      ...items,
    ]);
  };

  const createOrder = (input: CreateOrderInput) => {
    const order: MarketplaceOrder = {
      id: nextId('ord'),
      clientName: 'Fixora Client',
      masterName: input.masterName,
      serviceTitle: input.serviceTitle,
      city: input.city,
      district: input.district,
      price: input.price,
      time: 'Today, flexible',
      distance: 'nearby',
      status: 'pending',
      createdAt: nowLabel(),
      unreadForClient: 0,
      unreadForMaster: 1,
    };

    setOrders((items) => [order, ...items]);
    setMessages((items) => [
      {
        id: nextId('msg'),
        orderId: order.id,
        sender: 'client',
        text: `Booking request sent for ${input.serviceTitle}.`,
        timestamp: nowLabel(),
        kind: 'text',
      },
      ...items,
    ]);
    addNotification('master', 'New nearby order', `${input.serviceTitle} in ${input.city} is ready to accept.`, 'order');

    return order;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    notification?: { role: UserRole; title: string; body: string; category: MarketplaceNotification['category'] },
  ) => {
    setOrders((items) => items.map((item) => (item.id === orderId ? { ...item, status } : item)));
    if (notification) {
      addNotification(notification.role, notification.title, notification.body, notification.category);
    }
  };

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      orders,
      messages,
      notifications,
      createOrder,
      acceptOrder: (orderId) =>
        updateOrderStatus(orderId, 'accepted', {
          role: 'client',
          title: 'Order accepted',
          body: 'Your master accepted the request. Chat is open now.',
          category: 'order',
        }),
      declineOrder: (orderId) =>
        updateOrderStatus(orderId, 'cancelled', {
          role: 'client',
          title: 'Order declined',
          body: 'This request was declined. You can book another professional.',
          category: 'order',
        }),
      startOrder: (orderId) =>
        updateOrderStatus(orderId, 'in_progress', {
          role: 'client',
          title: 'Order started',
          body: 'Your service is now in progress.',
          category: 'order',
        }),
      completeOrder: (orderId) =>
        updateOrderStatus(orderId, 'completed', {
          role: 'client',
          title: 'Order completed',
          body: 'Please rate your experience and leave a review.',
          category: 'order',
        }),
      cancelOrder: (orderId) =>
        updateOrderStatus(orderId, 'cancelled', {
          role: 'master',
          title: 'Client cancelled order',
          body: 'A client cancelled one active request.',
          category: 'order',
        }),
      sendMessage: (orderId, sender, text, kind = 'text') => {
        if (!text.trim() && kind === 'text') {
          return;
        }

        setMessages((items) => [
          ...items,
          { id: nextId('msg'), orderId, sender, text: text.trim(), timestamp: nowLabel(), kind },
        ]);
        setOrders((items) =>
          items.map((item) => {
            if (item.id !== orderId) {
              return item;
            }

            return sender === 'client'
              ? { ...item, unreadForMaster: item.unreadForMaster + 1 }
              : { ...item, unreadForClient: item.unreadForClient + 1 };
          }),
        );
        addNotification(
          sender === 'client' ? 'master' : 'client',
          'New message',
          sender === 'client' ? 'Client sent a new message.' : 'Master sent a new message.',
          'message',
        );
      },
      submitReview: (orderId, rating, text, photoAttached) => {
        setOrders((items) =>
          items.map((item) => (item.id === orderId ? { ...item, review: { rating, text, photoAttached } } : item)),
        );
        addNotification('master', 'New review received', `${rating} stars review was added to a completed order.`, 'review');
      },
      markNotificationsRead: (role) =>
        setNotifications((items) => items.map((item) => (item.role === role ? { ...item, unread: false } : item))),
    }),
    [messages, notifications, orders],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);

  if (!context) {
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  }

  return context;
}
