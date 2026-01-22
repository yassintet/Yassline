const Transport = require('../models/Transport');

// GET /api/transport - Listar todos los servicios de transporte
exports.getAllTransports = async (req, res) => {
  try {
    const { type, active } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (active !== undefined) filter.active = active === 'true';
    
    const transports = await Transport.find(filter).sort({ type: 1, createdAt: -1 });
    res.json({
      success: true,
      count: transports.length,
      data: transports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios de transporte',
      error: error.message,
    });
  }
};

// GET /api/transport/:id - Obtener servicio por ID
exports.getTransportById = async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id);
    
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Servicio de transporte no encontrado',
      });
    }
    
    res.json({
      success: true,
      data: transport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicio',
      error: error.message,
    });
  }
};

// POST /api/transport - Crear nuevo servicio
exports.createTransport = async (req, res) => {
  try {
    const transport = new Transport(req.body);
    await transport.save();
    
    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: transport,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear servicio',
      error: error.message,
    });
  }
};

// PUT /api/transport/:id - Actualizar servicio
exports.updateTransport = async (req, res) => {
  try {
    const transport = await Transport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }
    
    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: transport,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar servicio',
      error: error.message,
    });
  }
};

// DELETE /api/transport/:id - Eliminar servicio
exports.deleteTransport = async (req, res) => {
  try {
    const transport = await Transport.findByIdAndDelete(req.params.id);
    
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }
    
    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente',
      data: transport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar servicio',
      error: error.message,
    });
  }
};
