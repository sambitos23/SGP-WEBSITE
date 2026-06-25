const crypto = require('crypto');
const connectDB = require('../lib/mongodb');
const User = require('../lib/User');
const handleCors = require('../lib/cors');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
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

    const { email, password } = req.body || {};

    const trimmedEmail = (email || '').trim();

    if (!trimmedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email: trimmedEmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email. Please sign up first.' });
    }

    // Verify password
    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
