import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Package, Calendar, Clock, Edit } from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';

const OrderDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement de la commande');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'confirmed' | 'delivered') => {
    if (!order || !id) return;
    
    try {
      await orderService.updateOrderStatus(id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDateTime = (date: string | number | Date) => {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { dateStr, timeStr };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Commande introuvable</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Commande introuvable</h3>
            <p className="text-red-700 mb-4">{error || 'La commande demandée n\'existe pas.'}</p>
            <button
              onClick={() => navigate('/admin')}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { dateStr: createdDateStr, timeStr: createdTimeStr } = formatDateTime(order.createdAt);
  const { dateStr: updatedDateStr, timeStr: updatedTimeStr } = formatDateTime(order.updatedAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Commande #{order.id.slice(-6)}
                </h1>
                <p className="text-blue-100 text-sm">Détails de la commande</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-xl border-2 font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Articles commandés ({order.items.length})
              </h3>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                      <Package className="h-6 w-6 text-gray-400 hidden" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.product.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </span>
                        <span className="font-semibold text-blue-600">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total de la commande</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Historique de la commande
              </h3>
              
              <div className="space-y-4">
                {/* Created */}
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">Commande créée</span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{createdDateStr}</span>
                        <Clock className="h-4 w-4" />
                        <span>{createdTimeStr}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-600' :
                    order.status === 'confirmed' ? 'bg-blue-600' : 'bg-yellow-600'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">Dernière mise à jour</span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{updatedDateStr}</span>
                        <Clock className="h-4 w-4" />
                        <span>{updatedTimeStr}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Statut: {getStatusText(order.status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info & Actions */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations client
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Nom complet</span>
                  </div>
                  <p className="text-gray-700 ml-6">
                    {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Téléphone</span>
                  </div>
                  <p className="text-gray-700 ml-6">
                    <a href={`tel:${order.customerInfo.phone}`} className="hover:text-blue-600 transition-colors">
                      {order.customerInfo.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Adresse</span>
                  </div>
                  <div className="text-gray-700 ml-6 space-y-1">
                    <p>{order.customerInfo.address}</p>
                    <p>{order.customerInfo.quarter}, {order.customerInfo.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Gestion du statut
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut actuel
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="delivered">Livrée</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>ID:</strong> {order.id}</p>
                    <p><strong>Articles:</strong> {order.items.length}</p>
                    <p><strong>Total:</strong> {formatPrice(order.total)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              
              <div className="space-y-3">
                <a
                  href={`tel:${order.customerInfo.phone}`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Appeler le client</span>
                </a>
                
                {order.status !== 'delivered' && (
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    <span>Confirmer la commande</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;