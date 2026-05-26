import { Professional, Service } from '../types/marketplace';

export const popularServices: Service[] = [
  { id: 's1', title: 'Apartment deep cleaning', category: 'Cleaning', price: 'from $89' },
  { id: 's2', title: 'Bathroom renovation estimate', category: 'Repair & Construction', price: 'from $39' },
  { id: 's3', title: 'AI website assistant setup', category: 'IT & AI', price: 'from $149' },
  { id: 's4', title: 'Premium airport transfer', category: 'Premium & VIP', price: 'from $120' },
];

export const professionals: Professional[] = [
  { id: 'p1', name: 'Maya Stone', role: 'Interior repair lead', rating: 4.98, city: 'Los Angeles', price: '$65/hr', verified: true },
  { id: 'p2', name: 'Daniel Price', role: 'AI automation expert', rating: 4.96, city: 'San Francisco', price: '$95/hr', verified: true },
  { id: 'p3', name: 'Lena Hart', role: 'Premium beauty concierge', rating: 4.99, city: 'Dubai Marina', price: '$140/hr', premium: true, verified: true },
  { id: 'p4', name: 'Arman Vardanyan', role: 'Construction supervisor', rating: 4.94, city: 'Yerevan', price: '$45/hr', verified: true },
  { id: 'p5', name: 'Sofia Klein', role: 'Event production manager', rating: 4.97, city: 'Munich', price: '$110/hr', premium: true, verified: true },
];
