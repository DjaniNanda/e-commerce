export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory: string;
  warranty: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    quarter: string;
  };
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}