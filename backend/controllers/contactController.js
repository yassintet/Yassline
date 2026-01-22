const Contact = require('../models/Contact');

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
    const contact = new Contact(req.body);
    await contact.save();
    
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
