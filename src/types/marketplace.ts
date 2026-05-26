export type Category = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  subcategories?: string[];
  popularServices?: string[];
  localServices?: string[];
};

export type Professional = {
  id: string;
  name: string;
  role: string;
  rating: number;
  city: string;
  price: string;
  premium?: boolean;
  verified?: boolean;
};

export type Service = {
  id: string;
  title: string;
  category: string;
  price: string;
};
