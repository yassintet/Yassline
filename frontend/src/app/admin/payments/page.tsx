"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { paymentsAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Check
} from "lucide-react";
import Link from "next/link";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'pending_review' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await paymentsAPI.getAll(params);
      if (response.success && response.data) {
        setPayments((response.data as any).payments || (Array.isArray(response.data) ? response.data : []) || []);
      } else {
        setError(response.error || 'Error al cargar pagos');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    if (!confirm('¿Confirmar este pago? Esto confirmará automáticamente la reserva asociada.')) {
      return;
    }

    setConfirmingPayment(paymentId);
    try {
      const response = await paymentsAPI.adminConfirm(paymentId, {});
      if (response.success) {
        await loadPayments();
      } else {
        alert(response.error || 'Error al confirmar pago');
      }
    } catch (err: any) {
      alert(err.message || 'Error al confirmar pago');
    } finally {
      setConfirmingPayment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      pending_review: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {status === 'pending' ? 'Pendiente' :
         status === 'pending_review' ? 'En Revisión' :
         status === 'completed' ? 'Completado' :
         status === 'failed' ? 'Fallido' :
         status === 'cancelled' ? 'Cancelado' : status}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Efectivo',
      bank_transfer: 'Transferencia Bancaria',
      binance: 'Binance Pay',
      redotpay: 'Redotpay',
      moneygram: 'MoneyGram',
    };

    return (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
        {methods[method] || method}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.customerName?.toLowerCase().includes(searchLower) ||
        payment.customerEmail?.toLowerCase().includes(searchLower) ||
        payment._id?.toLowerCase().includes(searchLower) ||
        payment.bookingId?.serviceName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--yass-gold)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pagos</h1>
            <p className="text-gray-600">Revisa y confirma los pagos pendientes</p>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, email o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'all' ? 'bg-[var(--yass-gold)] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('pending_review')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'pending_review' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  En Revisión
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Completados
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Lista de Pagos */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No hay pagos que mostrar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reserva</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Método</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.customerName}</p>
                            <p className="text-sm text-gray-500">{payment.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/admin/bookings/${payment.bookingId?._id || payment.bookingId}`}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {payment.bookingId?.serviceName || 'N/A'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getMethodBadge(payment.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-gray-900">
                            {payment.amount?.toLocaleString()} {payment.currency || 'MAD'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/bookings/${payment.bookingId?._id || payment.bookingId}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            {(payment.status === 'pending_review' || payment.status === 'pending') && (
                              <button
                                onClick={() => handleConfirmPayment(payment._id)}
                                disabled={confirmingPayment === payment._id}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                {confirmingPayment === payment._id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Check className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
