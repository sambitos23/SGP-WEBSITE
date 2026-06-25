const connectDB = require('../lib/mongodb');
const Contact = require('../lib/Contact');
const handleCors = require('../lib/cors');

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    await connectDB();

    const { name, email, subject, message } = req.body || {};

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();
    const trimmedSubject = (subject || '').trim();
    const trimmedMessage = (message || '').trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    await Contact.create({
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
    });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};
