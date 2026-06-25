/**
 * CORS helper for Vercel serverless functions.
 * Handles preflight OPTIONS requests and sets headers on all responses.
 */

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Wraps a handler with CORS support.
 * Returns true if the request was a preflight (already handled), false otherwise.
 */
function handleCors(req, res) {
  setCorsHeaders(res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

module.exports = handleCors;
