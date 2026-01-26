const Contact = require('../models/Contact');
const emailService = require('../services/emailService');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@yassline.com';

// GET /api/contact - Listar todos los mensajes de contacto
exports.getAllContacts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    
    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
      error: error.message,
    });
  }
};

// GET /api/contact/:id - Obtener mensaje por ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado',
      });
    }
    
    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensaje',
      error: error.message,
    });
  }
};

// POST /api/contact - Crear nuevo mensaje de contacto
exports.createContact = async (req, res) => {
  try {
    // Mapear valores de servicio del frontend a los valores del modelo
    const servicioFrontend = req.body.serviceType || req.body.servicio || '';
    let serviceType = 'otro';
    
    // Mapear valores del frontend a valores del modelo
    if (servicioFrontend === 'transporte' || servicioFrontend === 'transport') {
      serviceType = 'transporte';
    } else if (servicioFrontend === 'circuitos' || servicioFrontend === 'circuito') {
      serviceType = 'circuito';
    } else if (servicioFrontend === 'vehiculos' || servicioFrontend === 'hotel') {
      // Mapear 'vehiculos' a 'otro' ya que no existe en el enum
      serviceType = 'otro';
    } else if (servicioFrontend === 'otro' || servicioFrontend === 'other') {
      serviceType = 'otro';
    }
    
    // Mapear nombres de campos del frontend al modelo
    const contactData = {
      name: req.body.name || req.body.nombre,
      email: req.body.email,
      phone: req.body.phone || req.body.telefono,
      serviceType: serviceType,
      message: req.body.message || req.body.mensaje,
    };
    
    const contact = new Contact(contactData);
    await contact.save();
    
    // Enviar notificaciones por email (no bloquear la respuesta si falla)
    try {
      console.log('📧 Iniciando envío de emails de contacto...');
      
      // Notificación al administrador
      console.log('📧 Enviando notificación al administrador:', ADMIN_EMAIL);
      const adminResult = await emailService.sendContactNotification({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        serviceType: contact.serviceType,
        message: contact.message,
      });
      
      if (adminResult.success) {
        console.log('✅ Email al administrador enviado:', adminResult.messageId);
      } else {
        console.error('❌ Error enviando email al administrador:', adminResult.error);
      }
      
      // Confirmación al cliente
      console.log('📧 Enviando confirmación al cliente:', contact.email);
      const clientResult = await emailService.sendContactConfirmation({
        name: contact.name,
        email: contact.email,
        message: contact.message,
      });
      
      if (clientResult.success) {
        console.log('✅ Email de confirmación al cliente enviado:', clientResult.messageId);
      } else {
        console.error('❌ Error enviando email de confirmación al cliente:', clientResult.error);
      }
    } catch (emailError) {
      console.error('❌ Excepción al enviar emails de contacto:', emailError.message);
      console.error('Stack:', emailError.stack);
      // No fallar la petición si el email falla
    }
    
    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: contact,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al enviar mensaje',
      error: error.message,
    });
  }
};

// PUT /api/contact/:id - Actualizar estado del mensaje
exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado',
      });
    }
    
    res.json({
      success: true,
      message: 'Mensaje actualizado exitosamente',
      data: contact,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar mensaje',
      error: error.message,
    });
  }
};

// DELETE /api/contact/:id - Eliminar mensaje
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado',
      });
    }
    
    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mensaje',
      error: error.message,
    });
  }
};
