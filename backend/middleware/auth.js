const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Authenticate user via Bearer token
async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  // Log auth attempt for debugging
  console.log(`🔐 Auth middleware - Path: ${req.path}, Token: ${token ? 'Present' : 'Missing'}, Header: ${header ? 'Present' : 'Missing'}`);
  
  if (!token) {
    console.error('❌ Auth failed: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded successfully, user ID:', decoded.id);
    
    // Fetch the full user object from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.error('❌ Auth failed: User not found in database, ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('✅ User found in database:', user.email, user.role);
    
    // Set both decoded payload and full user object for compatibility
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    };
    
    next();
  } catch (e) {
    console.error('Token verification error:', e.name, e.message);
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    } else if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Authorize by roles
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ Authorization failed: No user in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Normalize role (trim whitespace, consistent casing)
    const userRole = req.user.role ? String(req.user.role).trim() : '';
    const normalizedRoles = roles.map(r => String(r).trim());
    
    console.log('🔐 Role Check:', {
      userId: req.user.id,
      userName: req.user.name,
      userRole: userRole,
      userRoleOriginal: req.user.role,
      userRoleLength: userRole.length,
      userRoleChars: userRole.split('').map(c => c.charCodeAt(0)),
      userRoleType: typeof req.user.role,
      requiredRoles: normalizedRoles,
      allowed: normalizedRoles.includes(userRole)
    });
    
    if (!normalizedRoles.includes(userRole)) {
      console.log(`❌ Access DENIED: User role "${userRole}" not in allowed roles:`, normalizedRoles);
      console.log('Detailed comparison:');
      normalizedRoles.forEach((r, i) => {
        console.log(`  ${i + 1}. "${r}" === "${userRole}" ? ${r === userRole}`);
        console.log(`     Role chars: ${r.split('').map(c => c.charCodeAt(0)).join(',')}`);
      });
      return res.status(403).json({ 
        message: 'Forbidden',
        userRole: userRole,
        requiredRoles: normalizedRoles
      });
    }
    
    console.log('✅ Access GRANTED');
    next();
  };
}

module.exports = { auth, allowRoles };