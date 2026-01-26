const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateContact,
  validateContactId,
  validateContactUpdate,
} = require('../middleware/validation');

// Ruta pública (para formulario de contacto)
router.post('/', validateContact, createContact);

// Rutas protegidas
router.get('/', authenticateToken, getAllContacts);
router.get('/:id', authenticateToken, validateContactId, getContactById);
router.put('/:id', authenticateToken, validateContactId, validateContactUpdate, updateContact);
router.delete('/:id', authenticateToken, validateContactId, deleteContact);

module.exports = router;
