import { CartItem } from '../types';

export const generateWhatsAppMessage = (orderData: {
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
}): string => {
  const { customerInfo, items, total } = orderData;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  let message = `🛒 *NOUVELLE COMMANDE - AUTO-BUSINESS*\n\n`;

  message += `👤 *Client:* ${customerInfo.firstName} ${customerInfo.lastName}\n`;
  message += `📱 *Téléphone:* ${customerInfo.phone}\n`;
  message += `📍 *Adresse:* ${customerInfo.address}, ${customerInfo.quarter}, ${customerInfo.city}\n\n`;

  message += `🛍️ *PRODUITS COMMANDÉS:*\n`;
  message += `${'─'.repeat(30)}\n\n`;

  items.forEach((item, index) => {
    message += `${index + 1}. *${item.product.name}*\n`;
    message += `   • Prix unitaire: ${formatPrice(item.product.price)}\n`;
    message += `   • Quantité: ${item.quantity}\n`;
    message += `   • Sous-total: ${formatPrice(item.product.price * item.quantity)}\n\n`;
  });

  message += `${'─'.repeat(30)}\n`;
  message += `💰 *TOTAL: ${formatPrice(total)}*\n\n`;

  message += `✅ Merci pour votre commande !`;

  return encodeURIComponent(message);
};

export const getWhatsAppUrl = (phoneNumber: string, message: string): string => {
  return `https://wa.me/${phoneNumber}?text=${message}`;
};
