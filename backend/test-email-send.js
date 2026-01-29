require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  console.log('🔍 Verificando configuración de email...\n');
  
  // Verificar variables de entorno
  console.log('Variables de entorno:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ NO configurado');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configurado (oculto)' : '❌ NO configurado');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'info@yassline.com');
  console.log('COMPANY_EMAIL:', process.env.COMPANY_EMAIL || 'info@yassline.com');
  console.log('COMPANY_NAME:', process.env.COMPANY_NAME || 'Yassline Tour');
  console.log('');
  
  // Test 1: Email al admin
  console.log('📧 Enviando email de prueba al administrador...');
  try {
    const result1 = await emailService.sendContactNotification({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+212666555444',
      serviceType: 'transporte',
      message: 'Este es un mensaje de prueba para verificar que el sistema de email funciona correctamente.'
    });
    
    if (result1.success) {
      console.log('✅ Email al admin enviado exitosamente:', result1.messageId);
    } else {
      console.log('❌ Error enviando email al admin:', result1.error);
    }
  } catch (error) {
    console.error('❌ Excepción al enviar email al admin:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('');
  
  // Test 2: Email de confirmación al cliente
  console.log('📧 Enviando email de confirmación al cliente...');
  try {
    const result2 = await emailService.sendContactConfirmation({
      name: 'Test User',
      email: process.env.ADMIN_EMAIL || 'info@yassline.com', // Usar el email del admin para pruebas
      message: 'Este es un mensaje de prueba.'
    });
    
    if (result2.success) {
      console.log('✅ Email de confirmación enviado exitosamente:', result2.messageId);
    } else {
      console.log('❌ Error enviando email de confirmación:', result2.error);
    }
  } catch (error) {
    console.error('❌ Excepción al enviar email de confirmación:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n✅ Prueba completada');
}

testEmail().catch(console.error);
