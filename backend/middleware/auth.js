const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Authenticate user via Bearer token
async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch the full user object from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
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