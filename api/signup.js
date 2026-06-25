const crypto = require('crypto');
const connectDB = require('../lib/mongodb');
const User = require('../lib/User');
const handleCors = require('../lib/cors');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function makeSalt() {
  return crypto.randomBytes(16).toString('hex');
}

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

    const { name, email, password } = req.body || {};

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();

    if (!trimmedName || !trimmedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are all required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: trimmedEmail.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in instead.' });
    }

    // Create user
    const salt = makeSalt();
    const passwordHash = hashPassword(password, salt);

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      salt,
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created.',
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
