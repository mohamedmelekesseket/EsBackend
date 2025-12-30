
// auth.js
import jwt from "jsonwebtoken";
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorized to access this route' });
    }

    const token = authHeader.split(' ')[1];

    // ✅ Use the exact same secret var used during signing
    const secret = process.env.JWT_SECRET || process.env.JWT_secret; // fallback just in case
    if (!secret) {
      console.error('JWT secret is missing from environment');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please login again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login.' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
}