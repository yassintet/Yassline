const Vehicle = require('../models/Vehicle');

// GET /api/vehicles - Listar todos los vehículos
exports.getAllVehicles = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    
    if (active !== undefined) filter.active = active === 'true';
    
    const vehicles = await Vehicle.find(filter).sort({ name: 1 });
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículos',
      error: error.message,
    });
  }
};

// GET /api/vehicles/:id - Obtener vehículo por ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado',
      });
    }
    
    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículo',
      error: error.message,
    });
  }
};

// POST /api/vehicles - Crear nuevo vehículo
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    
    res.status(201).json({
      success: true,
      message: 'Vehículo creado exitosamente',
      data: vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear vehículo',
      error: error.message,
    });
  }
};

// PUT /api/vehicles/:id - Actualizar vehículo
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado',
      });
    }
    
    res.json({
      success: true,
      message: 'Vehículo actualizado exitosamente',
      data: vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar vehículo',
      error: error.message,
    });
  }
};

// DELETE /api/vehicles/:id - Eliminar vehículo
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado',
      });
    }
    
    res.json({
      success: true,
      message: 'Vehículo eliminado exitosamente',
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar vehículo',
      error: error.message,
    });
  }
};
