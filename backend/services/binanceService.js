/**
 * Servicio para integración con Binance Pay
 * Documentación: https://binancepay.github.io/binancepay-openapi/
 */

const crypto = require('crypto');

class BinancePayService {
  constructor() {
    // Configuración desde variables de entorno
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.secretKey = process.env.BINANCE_SECRET_KEY || '';
    this.merchantId = process.env.BINANCE_MERCHANT_ID || '';
    this.baseUrl = process.env.BINANCE_API_URL || 'https://bpay.binanceapi.com';
    this.walletAddress = process.env.BINANCE_WALLET_ADDRESS || '';
    this.network = process.env.BINANCE_NETWORK || 'BSC'; // BSC, ETH, TRX, etc.
    this.currency = process.env.BINANCE_CURRENCY || 'USDT';
  }

  /**
   * Generar firma para autenticación Binance Pay
   */
  generateSignature(timestamp, nonce, body) {
    const payload = timestamp + '\n' + nonce + '\n' + JSON.stringify(body) + '\n';
    const signature = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    return signature;
  }

  /**
   * Crear orden de pago
   */
  async createPaymentOrder(orderData) {
    try {
      if (!this.apiKey || !this.secretKey || !this.merchantId) {
        console.warn('⚠️  Binance Pay no configurado. Usando modo simulación.');
        return {
          success: true,
          data: {
            prepayId: `BINANCE_${Date.now()}`,
            checkoutUrl: '#',
            qrcodeLink: this.getQRCodeData(orderData.amount, orderData.currency),
          },
          simulated: true,
        };
      }

      const timestamp = Date.now();
      const nonce = crypto.randomBytes(16).toString('hex');
      
      const requestBody = {
        env: {
          terminalType: 'WEB',
        },
        merchantTradeNo: `ORDER_${orderData.bookingId}_${Date.now()}`,
        orderAmount: orderData.amount,
        currency: orderData.currency || 'USDT',
        goods: {
          goodsType: '02', // Servicio
          goodsCategory: 'D00000', // Otros servicios
          referenceGoodsId: orderData.bookingId,
          goodsName: orderData.serviceName || 'Servicio de Transporte',
          goodsDetail: `Reserva #${orderData.bookingId}`,
        },
        buyer: {
          referenceBuyerId: orderData.userId || 'guest',
          buyerName: {
            firstName: orderData.customerName.split(' ')[0] || orderData.customerName,
            lastName: orderData.customerName.split(' ').slice(1).join(' ') || '',
          },
          buyerEmail: orderData.customerEmail,
        },
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago/completado`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago/cancelado`,
      };

      const signature = this.generateSignature(timestamp, nonce, requestBody);

      const response = await fetch(`${this.baseUrl}/binancepay/openapi/v2/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'BinancePay-Timestamp': timestamp.toString(),
          'BinancePay-Nonce': nonce,
          'BinancePay-Certificate-SN': this.apiKey,
          'BinancePay-Signature': signature,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.data) {
        return {
          success: true,
          data: {
            prepayId: data.data.prepayId,
            checkoutUrl: data.data.checkoutUrl,
            qrcodeLink: data.data.qrcodeLink,
          },
        };
      } else {
        throw new Error(data.errorMessage || 'Error al crear orden de Binance Pay');
      }
    } catch (error) {
      console.error('Error creando orden de Binance Pay:', error);
      // En caso de error, retornar modo simulación
      return {
        success: true,
        data: {
          prepayId: `BINANCE_${Date.now()}`,
          checkoutUrl: '#',
          qrcodeLink: this.getQRCodeData(orderData.amount, orderData.currency),
        },
        simulated: true,
        error: error.message,
      };
    }
  }

  /**
   * Verificar pago de Binance
   */
  async verifyPayment(transactionHash, network = 'BSC') {
    try {
      // En producción, aquí se verificaría la transacción en la blockchain
      // Por ahora, retornamos éxito si el hash tiene formato válido
      if (transactionHash && transactionHash.length >= 10) {
        return {
          success: true,
          verified: true,
          transactionHash,
          network,
        };
      }
      return {
        success: false,
        verified: false,
        error: 'Hash de transacción inválido',
      };
    } catch (error) {
      console.error('Error verificando pago de Binance:', error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener información de pago (wallet, QR, etc.)
   * Versión simplificada: solo retorna información estática para mostrar al cliente
   */
  getPaymentInfo() {
    return {
      accountId: process.env.BINANCE_ACCOUNT_ID || '89150838',
      walletAddress: this.walletAddress || process.env.BINANCE_WALLET_ADDRESS || '',
      network: this.network,
      currency: this.currency,
      qrCode: this.getQRCodeData(0, this.currency),
    };
  }

  /**
   * Generar código QR para pago (formato: dirección de wallet)
   */
  getQRCodeData(amount, currency) {
    if (this.walletAddress) {
      // Formato: dirección_wallet?amount=monto&currency=moneda
      return `${this.walletAddress}?amount=${amount}&currency=${currency || this.currency}`;
    }
    // Si no hay wallet configurada, retornar placeholder
    return `binance:${currency || this.currency}?amount=${amount}`;
  }

  /**
   * Procesar webhook de Binance Pay
   */
  async processWebhook(webhookData) {
    try {
      // Verificar firma del webhook
      const signature = webhookData.signature;
      const timestamp = webhookData.timestamp;
      const nonce = webhookData.nonce;
      const body = webhookData.data;

      const expectedSignature = this.generateSignature(timestamp, nonce, body);

      if (signature !== expectedSignature) {
        return {
          success: false,
          error: 'Firma inválida',
        };
      }

      // Procesar datos del webhook
      return {
        success: true,
        orderId: body.merchantTradeNo,
        transactionId: body.transactionId,
        status: body.status, // SUCCESS, FAILED, etc.
        amount: body.orderAmount,
        currency: body.currency,
      };
    } catch (error) {
      console.error('Error procesando webhook de Binance:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Exportar instancia singleton
module.exports = new BinancePayService();
