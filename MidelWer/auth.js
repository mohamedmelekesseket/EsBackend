
// auth.js
import jwt from "jsonwebtoken";
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Change: Get token from cookies instead of headers
    const token = req.cookies.token; 

    // 2. Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    const secret = process.env.JWT_SECRET;
    
    // 3. Verify as usual
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
}