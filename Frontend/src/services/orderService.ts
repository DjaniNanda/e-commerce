import { api } from './api';
import { Order, CartItem } from '../types';

export interface CreateOrderRequest {
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
}

export const orderService = {
  // Créer une nouvelle commande
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    return await api.post('/orders', orderData);
  },

  // Récupérer toutes les commandes (Admin)
  getAllOrders: async (): Promise<Order[]> => {
    return await api.get('/orders');
  },

  // Récupérer une commande par ID
  getOrderById: async (id: string): Promise<Order> => {
    return await api.get(`/orders/${id}`);
  },

  // Mettre à jour le statut d'une commande (Admin)
  updateOrderStatus: async (id: string, status: 'pending' | 'confirmed' | 'delivered'): Promise<Order> => {
    return await api.put(`/orders/${id}/status`, { status });
  },

  // Récupérer les commandes par numéro de téléphone
  getOrdersByPhone: async (phone: string): Promise<Order[]> => {
    return await api.get(`/orders/phone/${phone}`);
  },

  // Supprimer une commande (Admin)
  deleteOrder: async (id: string): Promise<void> => {
    return await api.delete(`/orders/${id}`);
  },
};