/**
 * Servicio para integración con Redotpay
 * Documentación: https://docs.redotpay.com/
 */

const crypto = require('crypto');

class RedotpayService {
  constructor() {
    // Configuración desde variables de entorno
    this.apiKey = process.env.REDOTPAY_API_KEY || '';
    this.secretKey = process.env.REDOTPAY_SECRET_KEY || '';
    this.merchantId = process.env.REDOTPAY_MERCHANT_ID || '';
    this.baseUrl = process.env.REDOTPAY_API_URL || 'https://api.redotpay.com';
    this.currency = process.env.REDOTPAY_CURRENCY || 'MAD';
  }

  /**
   * Generar firma para autenticación Redotpay
   */
  generateSignature(params, secretKey) {
    // Ordenar parámetros alfabéticamente
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // Agregar secret key
    const signString = sortedParams + '&key=' + secretKey;
    
    // Generar MD5 hash
    const signature = crypto
      .createHash('md5')
      .update(signString, 'utf8')
      .digest('hex')
      .toUpperCase();
    
    return signature;
  }

  /**
   * Crear orden de pago
   */
  async createPaymentOrder(orderData) {
    try {
      if (!this.apiKey || !this.secretKey || !this.merchantId) {
        console.warn('⚠️  Redotpay no configurado. Usando modo simulación.');
        return {
          success: true,
          data: {
            orderId: `REDOTPAY_${Date.now()}`,
            paymentUrl: '#',
            qrCode: this.getQRCodeData(orderData.amount, orderData.currency),
          },
          simulated: true,
        };
      }

      const orderId = `ORDER_${orderData.bookingId}_${Date.now()}`;
      
      const params = {
        merchant_id: this.merchantId,
        order_id: orderId,
        amount: orderData.amount.toString(),
        currency: orderData.currency || this.currency,
        goods_name: orderData.serviceName || 'Servicio de Transporte',
        notify_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/payments/webhook/redotpay`,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago/completado`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago/cancelado`,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        timestamp: Date.now().toString(),
      };

      // Generar firma
      const signature = this.generateSignature(params, this.secretKey);
      params.sign = signature;

      const response = await fetch(`${this.baseUrl}/v1/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (data.code === '0000' && data.data) {
        return {
          success: true,
          data: {
            orderId: data.data.order_id || orderId,
            paymentUrl: data.data.payment_url,
            qrCode: data.data.qr_code || this.getQRCodeData(orderData.amount, orderData.currency),
          },
        };
      } else {
        throw new Error(data.message || 'Error al crear orden de Redotpay');
      }
    } catch (error) {
      console.error('Error creando orden de Redotpay:', error);
      // En caso de error, retornar modo simulación
      return {
        success: true,
        data: {
          orderId: `REDOTPAY_${Date.now()}`,
          paymentUrl: '#',
          qrCode: this.getQRCodeData(orderData.amount, orderData.currency),
        },
        simulated: true,
        error: error.message,
      };
    }
  }

  /**
   * Verificar pago de Redotpay
   */
  async verifyPayment(orderId) {
    try {
      if (!this.apiKey || !this.secretKey) {
        return {
          success: false,
          verified: false,
          error: 'Redotpay no configurado',
        };
      }

      const params = {
        merchant_id: this.merchantId,
        order_id: orderId,
        timestamp: Date.now().toString(),
      };

      const signature = this.generateSignature(params, this.secretKey);
      params.sign = signature;

      const response = await fetch(`${this.baseUrl}/v1/payment/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (data.code === '0000' && data.data) {
        return {
          success: true,
          verified: data.data.status === 'paid' || data.data.status === 'success',
          transactionId: data.data.transaction_id,
          status: data.data.status,
        };
      } else {
        return {
          success: false,
          verified: false,
          error: data.message || 'Error al verificar pago',
        };
      }
    } catch (error) {
      console.error('Error verificando pago de Redotpay:', error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener información de pago (versión simplificada)
   * Solo retorna información estática para mostrar al cliente
   */
  getPaymentInfo() {
    return {
      accountId: process.env.REDOTPAY_ACCOUNT_ID || '1764625181',
      merchantId: this.merchantId || process.env.REDOTPAY_MERCHANT_ID || '',
    };
  }

  /**
   * Generar código QR para pago
   */
  getQRCodeData(amount, currency) {
    // En producción, esto vendría de la API de Redotpay
    // Por ahora, retornamos un placeholder
    return `redotpay:${currency || this.currency}?amount=${amount}`;
  }

  /**
   * Procesar webhook de Redotpay
   */
  async processWebhook(webhookData) {
    try {
      // Verificar firma del webhook
      const receivedSign = webhookData.sign;
      const params = { ...webhookData };
      delete params.sign;

      const expectedSign = this.generateSignature(params, this.secretKey);

      if (receivedSign !== expectedSign) {
        return {
          success: false,
          error: 'Firma inválida',
        };
      }

      // Procesar datos del webhook
      return {
        success: true,
        orderId: webhookData.order_id,
        transactionId: webhookData.transaction_id,
        status: webhookData.status, // paid, failed, cancelled
        amount: webhookData.amount,
        currency: webhookData.currency,
      };
    } catch (error) {
      console.error('Error procesando webhook de Redotpay:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Exportar instancia singleton
module.exports = new RedotpayService();
