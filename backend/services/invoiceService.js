const PDFDocument = require('pdfkit');

/**
 * Generar factura en PDF
 */
const generateInvoice = (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Configuración de la factura
      const companyName = process.env.COMPANY_NAME || 'Yassline Tour';
      const companyAddress = process.env.COMPANY_ADDRESS || 'Marruecos';
      const companyEmail = process.env.COMPANY_EMAIL || 'info@yassline.com';
      const companyPhone = process.env.COMPANY_PHONE || '+212 XXX XXX XXX';
      
      const invoiceNumber = invoiceData.invoiceNumber || `INV-${Date.now()}`;
      const invoiceDate = invoiceData.date || new Date().toLocaleDateString('es-ES');
      const dueDate = invoiceData.dueDate || invoiceDate;

      // Encabezado
      doc.fontSize(24).fillColor('#0066CC').text(companyName, 50, 50);
      doc.fontSize(10).fillColor('#666').text(companyAddress, 50, 80);
      doc.text(`Email: ${companyEmail}`, 50, 95);
      doc.text(`Tel: ${companyPhone}`, 50, 110);

      // Título de factura
      doc.fontSize(20).fillColor('#000').text('FACTURA', 400, 50, { align: 'right' });
      doc.fontSize(10).fillColor('#666');
      doc.text(`Número: ${invoiceNumber}`, 400, 80, { align: 'right' });
      doc.text(`Fecha: ${invoiceDate}`, 400, 95, { align: 'right' });
      doc.text(`Vencimiento: ${dueDate}`, 400, 110, { align: 'right' });

      // Información del cliente
      let yPos = 150;
      doc.fontSize(14).fillColor('#000').text('Facturar a:', 50, yPos);
      yPos += 20;
      doc.fontSize(10).fillColor('#333');
      doc.text(invoiceData.customerName || 'Cliente', 50, yPos);
      if (invoiceData.customerEmail) {
        yPos += 15;
        doc.text(`Email: ${invoiceData.customerEmail}`, 50, yPos);
      }
      if (invoiceData.customerPhone) {
        yPos += 15;
        doc.text(`Teléfono: ${invoiceData.customerPhone}`, 50, yPos);
      }
      if (invoiceData.customerAddress) {
        yPos += 15;
        doc.text(`Dirección: ${invoiceData.customerAddress}`, 50, yPos);
      }

      // Línea separadora
      yPos += 30;
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

      // Detalles del servicio
      yPos += 20;
      doc.fontSize(14).fillColor('#000').text('Detalles del Servicio', 50, yPos);
      yPos += 25;

      // Tabla de servicios
      const tableTop = yPos;
      const itemHeight = 30;
      
      // Encabezados de tabla
      doc.fontSize(10).fillColor('#666');
      doc.text('Descripción', 50, tableTop);
      doc.text('Cantidad', 300, tableTop);
      doc.text('Precio Unit.', 380, tableTop, { align: 'right' });
      doc.text('Total', 480, tableTop, { align: 'right' });

      yPos = tableTop + 20;
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
      yPos += 10;

      // Items de la factura
      const items = invoiceData.items || [
        {
          description: invoiceData.serviceName || 'Servicio de transporte',
          quantity: invoiceData.quantity || 1,
          unitPrice: invoiceData.unitPrice || invoiceData.total || 0,
          total: invoiceData.total || 0,
        },
      ];

      items.forEach((item, index) => {
        const itemY = yPos + (index * itemHeight);
        
        doc.fontSize(10).fillColor('#000');
        doc.text(item.description || 'Servicio', 50, itemY, { width: 240 });
        doc.text(String(item.quantity || 1), 300, itemY);
        doc.text(`${formatCurrency(item.unitPrice || 0)}`, 380, itemY, { align: 'right' });
        doc.text(`${formatCurrency(item.total || item.unitPrice * item.quantity || 0)}`, 480, itemY, { align: 'right' });
      });

      // Totales
      yPos = tableTop + 20 + (items.length * itemHeight) + 20;
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
      yPos += 20;

      const subtotal = invoiceData.subtotal || invoiceData.total || 0;
      const tax = invoiceData.tax || 0;
      const discount = invoiceData.discount || 0;
      const total = invoiceData.total || (subtotal + tax - discount);

      doc.fontSize(10).fillColor('#333');
      if (discount > 0) {
        doc.text('Subtotal:', 380, yPos, { align: 'right' });
        doc.text(formatCurrency(subtotal), 480, yPos, { align: 'right' });
        yPos += 20;
        doc.text('Descuento:', 380, yPos, { align: 'right' });
        doc.text(`-${formatCurrency(discount)}`, 480, yPos, { align: 'right' });
        yPos += 20;
      }
      if (tax > 0) {
        doc.text(`IVA (${invoiceData.taxRate || 0}%):`, 380, yPos, { align: 'right' });
        doc.text(formatCurrency(tax), 480, yPos, { align: 'right' });
        yPos += 20;
      }
      
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
      doc.text('TOTAL:', 380, yPos, { align: 'right' });
      doc.text(formatCurrency(total), 480, yPos, { align: 'right' });

      // Notas adicionales
      if (invoiceData.notes) {
        yPos += 40;
        doc.fontSize(10).fillColor('#666').font('Helvetica');
        doc.text('Notas:', 50, yPos);
        yPos += 15;
        doc.text(invoiceData.notes, 50, yPos, { width: 500 });
      }

      // Pie de página
      const pageHeight = doc.page.height;
      doc.fontSize(8).fillColor('#999');
      doc.text(
        `Gracias por su confianza. Para cualquier consulta, contacte con ${companyEmail}`,
        50,
        pageHeight - 50,
        { align: 'center', width: 500 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Formatear moneda
 */
const formatCurrency = (amount, currency = 'MAD') => {
  // Si currency es EUR, mostrar en euros, sino en MAD
  if (currency === 'EUR') {
    return `${amount.toFixed(2)} €`;
  }
  // Para MAD, mostrar con formato marroquí
  return `${amount.toFixed(2)} MAD`;
};

module.exports = {
  generateInvoice,
};
