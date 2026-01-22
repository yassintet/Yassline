const Circuit = require('../models/Circuit');

// GET /api/circuits - Listar todos los circuitos
exports.getAllCircuits = async (req, res) => {
  try {
    const { featured, active } = req.query;
    const filter = {};
    
    if (featured !== undefined) filter.featured = featured === 'true';
    if (active !== undefined) filter.active = active === 'true';
    
    const circuits = await Circuit.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: circuits.length,
      data: circuits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener circuitos',
      error: error.message,
    });
  }
};

// GET /api/circuits/:id - Obtener un circuito por ID
exports.getCircuitById = async (req, res) => {
  try {
    const circuit = await Circuit.findById(req.params.id);
    
    if (!circuit) {
      return res.status(404).json({
        success: false,
        message: 'Circuito no encontrado',
      });
    }
    
    res.json({
      success: true,
      data: circuit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener circuito',
      error: error.message,
    });
  }
};

// GET /api/circuits/slug/:slug - Obtener circuito por slug
exports.getCircuitBySlug = async (req, res) => {
  try {
    const circuit = await Circuit.findOne({ slug: req.params.slug });
    
    if (!circuit) {
      return res.status(404).json({
        success: false,
        message: 'Circuito no encontrado',
      });
    }
    
    res.json({
      success: true,
      data: circuit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener circuito',
      error: error.message,
    });
  }
};

// POST /api/circuits - Crear nuevo circuito
exports.createCircuit = async (req, res) => {
  try {
    const circuit = new Circuit(req.body);
    await circuit.save();
    
    res.status(201).json({
      success: true,
      message: 'Circuito creado exitosamente',
      data: circuit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear circuito',
      error: error.message,
    });
  }
};

// PUT /api/circuits/:id - Actualizar circuito
exports.updateCircuit = async (req, res) => {
  try {
    const circuit = await Circuit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!circuit) {
      return res.status(404).json({
        success: false,
        message: 'Circuito no encontrado',
      });
    }
    
    res.json({
      success: true,
      message: 'Circuito actualizado exitosamente',
      data: circuit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar circuito',
      error: error.message,
    });
  }
};

// DELETE /api/circuits/:id - Eliminar circuito
exports.deleteCircuit = async (req, res) => {
  try {
    const circuit = await Circuit.findByIdAndDelete(req.params.id);
    
    if (!circuit) {
      return res.status(404).json({
        success: false,
        message: 'Circuito no encontrado',
      });
    }
    
    res.json({
      success: true,
      message: 'Circuito eliminado exitosamente',
      data: circuit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar circuito',
      error: error.message,
    });
  }
};

// GET /api/circuits/search?q=query - Búsqueda de circuitos
exports.searchCircuits = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda requerido',
      });
    }
    
    // Búsqueda con regex (simple) - Para Atlas Search usarías aggregate con $search
    const circuits = await Circuit.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
      active: true,
    });
    
    res.json({
      success: true,
      count: circuits.length,
      data: circuits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message,
    });
  }
};
