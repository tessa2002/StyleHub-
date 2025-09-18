const express = require('express');
// Using built-in fetch available in Node 18+
const { auth, allowRoles } = require('../middleware/auth');

// WhatsApp via Meta Cloud API placeholder
// Requires env: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID

const router = express.Router();

router.post('/whatsapp/send', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { to, template, body } = req.body; // e.g., template or simple body text
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId) return res.status(400).json({ message: 'WhatsApp not configured' });

    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: body || 'Hello from Style Hub!' }
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(400).json({ success: false, message: data?.error?.message || 'Failed to send' });
    }

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;