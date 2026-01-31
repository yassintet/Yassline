"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { 
  CreditCard, 
  Banknote, 
  Building2, 
  Wallet,
  CheckCircle2,
  Loader2,
  Globe
} from "lucide-react";

export type PaymentMethod = 'cash' | 'bank_transfer' | 'binance' | 'redotpay' | 'moneygram';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  amount: number;
  currency?: string;
  loading?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  amount,
  currency = 'MAD',
  loading = false,
}) => {
  const { t } = useI18n();

  const methods: Array<{
    id: PaymentMethod;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'cash',
      icon: <Banknote className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'bank_transfer',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'binance',
      icon: <Wallet className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-600',
    },
    {
      id: 'redotpay',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'moneygram',
      icon: <Globe className="w-6 h-6" />,
      color: 'from-indigo-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
          {t('payment.selectMethod') || 'Selecciona un método de pago'}
        </h3>
        <p className="text-gray-600">Elige la forma más conveniente para ti</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const methodKey = `payment.methods.${method.id}`;
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => !loading && onSelectMethod(method.id)}
              disabled={loading}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 transform
                ${isSelected 
                  ? `border-[var(--yass-gold)] bg-gradient-to-br ${method.color} text-white shadow-2xl scale-[1.02] ring-4 ring-[var(--yass-gold)]/20` 
                  : 'border-gray-200 bg-white hover:border-[var(--yass-gold)]/50 hover:shadow-xl text-gray-700 hover:scale-[1.01]'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                overflow-hidden group
              `}
            >
              {/* Efecto de brillo animado */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`
                    p-4 rounded-xl transition-all duration-300
                    ${isSelected 
                      ? 'bg-white/30 backdrop-blur-sm shadow-lg' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                    }
                  `}>
                    <div className={isSelected ? 'text-white' : 'text-gray-700'}>
                      {method.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-xl mb-2">
                      {t(`${methodKey}.name`)}
                    </h4>
                    <p className={`text-sm leading-relaxed ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                      {t(`${methodKey}.description`)}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <div className="bg-white/30 backdrop-blur-sm rounded-full p-2">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/90">
                        {t('payment.amount') || 'Monto a Pagar'}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {amount.toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-6 bg-white rounded-xl shadow-md">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--yass-gold)] mr-3" />
          <span className="text-gray-600 font-medium">{t('payment.processing') || 'Procesando...'}</span>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
