/**
 * Configuración de información bancaria para transferencias
 * Esta información se muestra al cliente cuando elige transferencia bancaria
 */

module.exports = {
  bankName: process.env.BANK_NAME || 'Banco de Marruecos',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890123456',
  accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'Yassline Tour',
  swiftCode: process.env.BANK_SWIFT_CODE || 'BMAEMAMC',
  iban: process.env.BANK_IBAN || 'MA64 1234 5678 9012 3456 7890 123',
  bankAddress: process.env.BANK_ADDRESS || 'Avenida Mohammed V, Marrakech, Marruecos',
  currency: process.env.BANK_CURRENCY || 'MAD',
  referenceFormat: process.env.BANK_REFERENCE_FORMAT || 'RES-{bookingId}',
};
