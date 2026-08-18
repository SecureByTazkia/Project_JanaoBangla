// ==========================================
// JanaoBangla — Emergency Contact Controller
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei controller ta emergency contacts er sob HTTP request handle korbe
// List, Add, Update, Delete — sob operation ekhane
// ==========================================

const EmergencyContactModel = require('../models/EmergencyContactModel');

// ==========================================
// MAX_CONTACTS_PER_USER — Ek user maximum koto contact rakhte parbe
// Abuse prevent korar jonno limit set kora hocche
// ==========================================
const MAX_CONTACTS_PER_USER = 5;

// ==========================================
// getContacts — User er sob emergency contacts list kora
// GET /api/emergency-contacts
// ==========================================
async function getContacts(req, res) {
  try {
    // Logged-in user er ID JWT theke newa hocche
    const userId = req.user.id;

    // User er sob emergency contacts fetch kora hocche
    const contacts = await EmergencyContactModel.getAllByUserId(userId);

    res.json({
      success: true,
      message: 'Emergency contacts fetched successfully',
      data: { contacts, total: contacts.length }
    });

  } catch (error) {
    // Database error hole 500 pathano hocche
    console.error('getContacts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emergency contacts' });
  }
}

// ==========================================
// addContact — Notun emergency contact add kora
// POST /api/emergency-contacts
// ==========================================
async function addContact(req, res) {
  try {
    // Logged-in user er ID JWT theke newa hocche
    const userId = req.user.id;
    const { name, phone, email, relationship, isPrimary } = req.body;

    // Required field validation kora hocche
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Contact name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact phone number is required' });
    }

    // Phone number basic format check (BD number ba international)
    const phoneClean = phone.trim().replace(/\s+/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    // User er existing contact count check kora hocche
    const existingCount = await EmergencyContactModel.countByUserId(userId);
    if (existingCount >= MAX_CONTACTS_PER_USER) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_CONTACTS_PER_USER} emergency contacts allowed per user`
      });
    }

    // Notun contact create kora hocche
    const newContact = await EmergencyContactModel.create({
      userId,
      name: name.trim(),
      phone: phoneClean,
      email: email ? email.trim() : null,
      relationship: relationship ? relationship.trim() : null,
      isPrimary: Boolean(isPrimary)
    });

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: { contact: newContact }
    });

  } catch (error) {
    // Database error hole 500 pathano hocche
    console.error('addContact error:', error);
    res.status(500).json({ success: false, message: 'Failed to add emergency contact' });
  }
}

// ==========================================
// updateContact — Existing contact er information update kora
// PUT /api/emergency-contacts/:id
// ==========================================
async function updateContact(req, res) {
  try {
    // Contact ID URL theke ar user ID JWT theke newa hocche
    const contactId = parseInt(req.params.id);
    const userId    = req.user.id;
    const { name, phone, email, relationship, isPrimary } = req.body;

    // Contact ID valid kina check kora hocche
    if (!contactId || isNaN(contactId)) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    // Contact exist kore kina ar ei user er kina check kora hocche
    const existing = await EmergencyContactModel.getByIdAndUserId(contactId, userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }

    // Required fields check kora hocche
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Contact name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact phone is required' });
    }

    // Contact update kora hocche
    const updated = await EmergencyContactModel.update(contactId, userId, {
      name: name.trim(),
      phone: phone.trim().replace(/\s+/g, ''),
      email: email ? email.trim() : null,
      relationship: relationship ? relationship.trim() : null,
      isPrimary: Boolean(isPrimary)
    });

    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: { contact: updated }
    });

  } catch (error) {
    // Update fail hoile error pathano hocche
    console.error('updateContact error:', error);
    res.status(500).json({ success: false, message: 'Failed to update emergency contact' });
  }
}

// ==========================================
// deleteContact — Emergency contact delete kora
// DELETE /api/emergency-contacts/:id
// ==========================================
async function deleteContact(req, res) {
  try {
    // Contact ID URL theke ar user ID JWT theke newa hocche
    const contactId = parseInt(req.params.id);
    const userId    = req.user.id;

    // Contact ID valid kina check kora hocche
    if (!contactId || isNaN(contactId)) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    // Contact exist kore kina check kora hocche
    const existing = await EmergencyContactModel.getByIdAndUserId(contactId, userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }

    // Contact delete kora hocche
    const affectedRows = await EmergencyContactModel.deleteById(contactId, userId);

    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contact could not be deleted' });
    }

    res.json({
      success: true,
      message: 'Emergency contact deleted successfully',
      data: { deletedId: contactId }
    });

  } catch (error) {
    // Delete fail hoile error pathano hocche
    console.error('deleteContact error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete emergency contact' });
  }
}

module.exports = {
  getContacts,
  addContact,
  updateContact,
  deleteContact
};
