const Transport = require('../models/Transport');
const Circuit = require('../models/Circuit');
const Vehicle = require('../models/Vehicle');

// GET /api/search - Búsqueda global
exports.globalSearch = async (req, res) => {
  try {
    const { q, type, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres',
      });
    }

    const searchTerm = q.trim();
    const results = {
      transports: [],
      circuits: [],
      vehicles: [],
    };

    // Buscar en transportes
    if (!type || type === 'transport') {
      const transports = await Transport.find({
        active: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { 'route.from': { $regex: searchTerm, $options: 'i' } },
          { 'route.to': { $regex: searchTerm, $options: 'i' } },
        ],
      })
        .limit(parseInt(limit))
        .select('name description type route price priceLabel active');
      
      results.transports = transports;
    }

    // Buscar en circuitos
    if (!type || type === 'circuit') {
      const circuits = await Circuit.find({
        active: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      })
        .limit(parseInt(limit))
        .select('name title description duration price priceLabel image slug featured active');
      
      results.circuits = circuits;
    }

    // Buscar en vehículos
    if (!type || type === 'vehicle') {
      const vehicles = await Vehicle.find({
        active: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { type: { $regex: searchTerm, $options: 'i' } },
        ],
      })
        .limit(parseInt(limit))
        .select('name type description capacity image features active');
      
      results.vehicles = vehicles;
    }

    const totalResults = results.transports.length + results.circuits.length + results.vehicles.length;

    res.json({
      success: true,
      data: results,
      total: totalResults,
      query: searchTerm,
    });
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar búsqueda',
      error: error.message,
    });
  }
};
