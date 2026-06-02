import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { marketplaceBackend } from '../services/marketplaceBackend';
import { UserRole } from '../types/navigation';

export type OrderStatus = 'pending' | 'accepted' | 'master_on_way' | 'in_progress' | 'completed' | 'cancelled';
export type MessageKind = 'text' | 'image' | 'voice';
export type PaymentStatus = 'unpaid' | 'reserved' | 'paid' | 'refunded' | 'failed';
export type PaymentMethodType = 'apple_pay' | 'google_pay' | 'bank_card' | 'idram' | 'telcell' | 'cash';
export type TransactionType = 'reserve' | 'release' | 'refund' | 'cashback' | 'promo' | 'payout' | 'commission';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
  saved?: boolean;
};

export type WalletTransaction = {
  id: string;
  orderId?: string;
  title: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  time: string;
};

export type ClientWallet = {
  balance: number;
  cashback: number;
  promoCodes: string[];
  savedCards: PaymentMethod[];
  paymentMethods: PaymentMethod[];
  transactions: WalletTransaction[];
};

export type MasterWallet = {
  earningsBalance: number;
  pendingPayouts: number;
  completedPayouts: number;
  commissionRate: number;
  transactions: WalletTransaction[];
};

export type MarketplaceOrder = {
  id: string;
  clientName: string;
  masterName: string;
  serviceTitle: string;
  city: string;
  district: string;
  price: string;
  amount: number;
  commission: number;
  masterEarnings: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethodType;
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
  clientWallet: ClientWallet;
  masterWallet: MasterWallet;
  createOrder: (input: CreateOrderInput) => MarketplaceOrder;
  reservePayment: (orderId: string, method?: PaymentMethodType) => void;
  releasePayment: (orderId: string) => void;
  refundPayment: (orderId: string) => void;
  applyPromoCode: (code: string) => void;
  requestPayout: () => void;
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
    amount: 8000,
    commission: 960,
    masterEarnings: 7040,
    paymentStatus: 'reserved',
    paymentMethod: 'bank_card',
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
    amount: 18000,
    commission: 2160,
    masterEarnings: 15840,
    paymentStatus: 'reserved',
    paymentMethod: 'idram',
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
    amount: 25000,
    commission: 3000,
    masterEarnings: 22000,
    paymentStatus: 'paid',
    paymentMethod: 'bank_card',
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
const commissionRate = 0.12;
const parsePrice = (price: string) => Number(price.replace(/[^0-9]/g, '')) || 0;
const calculateCommission = (amount: number) => Math.round(amount * commissionRate);
const calculateMasterEarnings = (amount: number) => amount - calculateCommission(amount);

const initialPaymentMethods: PaymentMethod[] = [
  { id: 'pm-card-1', type: 'bank_card', label: 'Bank Card', detail: 'Visa Platinum 4242', saved: true },
  { id: 'pm-idram', type: 'idram', label: 'Idram', detail: 'Connected wallet' },
  { id: 'pm-telcell', type: 'telcell', label: 'Telcell Wallet', detail: 'Ready for top-up' },
  { id: 'pm-cash', type: 'cash', label: 'Cash', detail: 'Pay after service' },
  { id: 'pm-apple', type: 'apple_pay', label: 'Apple Pay', detail: 'Available on iOS' },
  { id: 'pm-google', type: 'google_pay', label: 'Google Pay', detail: 'Available on Android' },
];

const initialClientWallet: ClientWallet = {
  balance: 42000,
  cashback: 1850,
  promoCodes: ['FIXORA10', 'SECUREPAY'],
  savedCards: initialPaymentMethods.filter((method) => method.saved),
  paymentMethods: initialPaymentMethods,
  transactions: [
    { id: 'tr-cashback', title: 'Cashback earned', amount: 850, type: 'cashback', status: 'completed', time: 'Today' },
    { id: 'tr-reserve-m3', orderId: 'm3', title: 'Secure deal released', amount: -25000, type: 'release', status: 'completed', time: 'Yesterday' },
  ],
};

const initialMasterWallet: MasterWallet = {
  earningsBalance: 22000,
  pendingPayouts: 0,
  completedPayouts: 48000,
  commissionRate,
  transactions: [
    { id: 'tr-master-m3', orderId: 'm3', title: 'Order earnings received', amount: 22000, type: 'release', status: 'completed', time: 'Yesterday' },
    { id: 'tr-commission-m3', orderId: 'm3', title: 'Fixora commission', amount: -3000, type: 'commission', status: 'completed', time: 'Yesterday' },
  ],
};

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<MarketplaceOrder[]>(initialOrders);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>(initialNotifications);
  const [clientWallet, setClientWallet] = useState<ClientWallet>(initialClientWallet);
  const [masterWallet, setMasterWallet] = useState<MasterWallet>(initialMasterWallet);

  const addNotification = (role: UserRole, title: string, body: string, category: MarketplaceNotification['category']) => {
    setNotifications((items) => [
      { id: nextId('ntf'), role, title, body, category, unread: true, time: nowLabel() },
      ...items,
    ]);
  };

  const createOrder = (input: CreateOrderInput) => {
    const amount = parsePrice(input.price);
    const commission = calculateCommission(amount);
    const order: MarketplaceOrder = {
      id: nextId('ord'),
      clientName: 'Fixora Client',
      masterName: input.masterName,
      serviceTitle: input.serviceTitle,
      city: input.city,
      district: input.district,
      price: input.price,
      amount,
      commission,
      masterEarnings: amount - commission,
      paymentStatus: 'reserved',
      paymentMethod: 'bank_card',
      time: 'Today, flexible',
      distance: 'nearby',
      status: 'pending',
      createdAt: nowLabel(),
      unreadForClient: 0,
      unreadForMaster: 1,
    };

    setOrders((items) => [order, ...items]);
    setClientWallet((wallet) => ({
      ...wallet,
      balance: wallet.balance - amount,
      cashback: wallet.cashback + Math.round(amount * 0.02),
      transactions: [
        {
          id: nextId('trx'),
          orderId: order.id,
          title: `Reserved for ${input.serviceTitle}`,
          amount: -amount,
          type: 'reserve',
          status: 'pending',
          time: nowLabel(),
        },
        {
          id: nextId('trx'),
          orderId: order.id,
          title: 'Cashback pending',
          amount: Math.round(amount * 0.02),
          type: 'cashback',
          status: 'pending',
          time: nowLabel(),
        },
        ...wallet.transactions,
      ],
    }));
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
    if (isSupabaseConfigured) {
      marketplaceBackend.createOrderForCurrentUser({ title: input.serviceTitle, amount, cityName: input.city }).catch(() => undefined);
    }

    return order;
  };

  const setPaymentStatus = (orderId: string, paymentStatus: PaymentStatus, method?: PaymentMethodType) => {
    setOrders((items) => items.map((item) => (item.id === orderId ? { ...item, paymentStatus, paymentMethod: method ?? item.paymentMethod } : item)));
  };

  const reservePayment = (orderId: string, method: PaymentMethodType = 'bank_card') => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.paymentStatus === 'reserved' || order.paymentStatus === 'paid') {
      return;
    }

    setPaymentStatus(orderId, 'reserved', method);
    if (isSupabaseConfigured) {
      marketplaceBackend.reservePayment(orderId).catch(() => undefined);
    }
    setClientWallet((wallet) => ({
      ...wallet,
      balance: wallet.balance - order.amount,
      transactions: [
        { id: nextId('trx'), orderId, title: `Reserved for ${order.serviceTitle}`, amount: -order.amount, type: 'reserve', status: 'pending', time: nowLabel() },
        ...wallet.transactions,
      ],
    }));
    addNotification('master', 'Payment reserved', 'Client funds are reserved in a secure deal.', 'payout');
  };

  const releasePayment = (orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.paymentStatus !== 'reserved' || order.status !== 'completed') {
      return;
    }

    setPaymentStatus(orderId, 'paid');
    if (isSupabaseConfigured) {
      marketplaceBackend.releasePayment(orderId).catch(() => undefined);
    }
    setClientWallet((wallet) => ({
      ...wallet,
      transactions: [
        { id: nextId('trx'), orderId, title: `Released to ${order.masterName}`, amount: -order.amount, type: 'release', status: 'completed', time: nowLabel() },
        ...wallet.transactions.map((item) => (item.orderId === orderId && item.type === 'reserve' ? { ...item, status: 'completed' as TransactionStatus } : item)),
      ],
    }));
    setMasterWallet((wallet) => ({
      ...wallet,
      earningsBalance: wallet.earningsBalance + order.masterEarnings,
      transactions: [
        { id: nextId('trx'), orderId, title: `Earnings for ${order.serviceTitle}`, amount: order.masterEarnings, type: 'release', status: 'completed', time: nowLabel() },
        { id: nextId('trx'), orderId, title: 'Fixora commission', amount: -order.commission, type: 'commission', status: 'completed', time: nowLabel() },
        ...wallet.transactions,
      ],
    }));
    addNotification('master', 'Money released', `${order.masterEarnings.toLocaleString()} AMD moved to your wallet.`, 'payout');
  };

  const refundPayment = (orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.paymentStatus !== 'reserved') {
      return;
    }

    setPaymentStatus(orderId, 'refunded');
    if (isSupabaseConfigured) {
      marketplaceBackend.refundPayment(orderId).catch(() => undefined);
    }
    setClientWallet((wallet) => ({
      ...wallet,
      balance: wallet.balance + order.amount,
      transactions: [
        { id: nextId('trx'), orderId, title: `Refund for ${order.serviceTitle}`, amount: order.amount, type: 'refund', status: 'completed', time: nowLabel() },
        ...wallet.transactions,
      ],
    }));
    addNotification('client', 'Payment refunded', 'Reserved funds returned to your wallet balance.', 'payout');
  };

  const applyPromoCode = (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode || clientWallet.promoCodes.includes(normalizedCode)) {
      return;
    }

    setClientWallet((wallet) => ({
      ...wallet,
      promoCodes: [normalizedCode, ...wallet.promoCodes],
      balance: wallet.balance + 1000,
      transactions: [
        { id: nextId('trx'), title: `${normalizedCode} promo credit`, amount: 1000, type: 'promo', status: 'completed', time: nowLabel() },
        ...wallet.transactions,
      ],
    }));
  };

  const requestPayout = () => {
    setMasterWallet((wallet) => {
      if (wallet.earningsBalance <= 0) {
        return wallet;
      }

      return {
        ...wallet,
        pendingPayouts: wallet.pendingPayouts + wallet.earningsBalance,
        earningsBalance: 0,
        transactions: [
          { id: nextId('trx'), title: 'Payout request', amount: wallet.earningsBalance, type: 'payout', status: 'pending', time: nowLabel() },
          ...wallet.transactions,
        ],
      };
    });
    addNotification('master', 'Payout requested', 'Mock payout request sent for processing.', 'payout');
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
      clientWallet,
      masterWallet,
      createOrder,
      reservePayment,
      releasePayment,
      refundPayment,
      applyPromoCode,
      requestPayout,
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
        {
          refundPayment(orderId);
          updateOrderStatus(orderId, 'cancelled', {
          role: 'master',
          title: 'Client cancelled order',
          body: 'A client cancelled one active request.',
          category: 'order',
          });
        },
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
    [clientWallet, masterWallet, messages, notifications, orders],
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
