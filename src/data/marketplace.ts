import { Professional, Service } from '../types/marketplace';

export const popularServices: Service[] = [
  { id: 's1', title: 'Apartment deep cleaning', category: 'Cleaning', amount: 34710 },
  { id: 's2', title: 'Bathroom renovation estimate', category: 'Repair & Construction', amount: 15210 },
  { id: 's3', title: 'AI website assistant setup', category: 'IT & AI', amount: 58110 },
  { id: 's4', title: 'Premium airport transfer', category: 'Premium & VIP', amount: 46800 },
];

export const professionals: Professional[] = [
  { id: 'p1', name: 'Maya Stone', role: 'Interior repair lead', rating: 4.98, city: 'Los Angeles', amount: 25350, unit: 'hr', verified: true },
  { id: 'p2', name: 'Daniel Price', role: 'AI automation expert', rating: 4.96, city: 'San Francisco', amount: 37050, unit: 'hr', verified: true },
  { id: 'p3', name: 'Lena Hart', role: 'Premium beauty concierge', rating: 4.99, city: 'Dubai Marina', amount: 54600, unit: 'hr', premium: true, verified: true },
  { id: 'p4', name: 'Arman Vardanyan', role: 'Construction supervisor', rating: 4.94, city: 'Yerevan', amount: 17550, unit: 'hr', verified: true },
  { id: 'p5', name: 'Sofia Klein', role: 'Event production manager', rating: 4.97, city: 'Munich', amount: 42900, unit: 'hr', premium: true, verified: true },
];
