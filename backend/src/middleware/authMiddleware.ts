import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Admin, { IAdmin } from '../models/Admin';


export interface AuthRequest extends Request {
  user?: IUser | any;
  isAdmin?: boolean;
}


export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      if (decoded.isAdmin) {
        req.user = await Admin.findById(decoded.id).select('-password') as any;
        if (!req.user) {
          console.error(`[AUTH] Admin record not found for ID: ${decoded.id}`);
        }
        req.isAdmin = true;
      } else {
        req.user = await User.findById(decoded.id).select('-password') as any;
        req.isAdmin = false;
      }
      
      return next();

    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.isAdmin) {
    next();
  } else {
    console.error(`[AUTH] Admin access denied. req.user: ${!!req.user}, req.isAdmin: ${req.isAdmin}`);
    res.status(403).json({ 
      success: false, 
      message: 'Not authorized as an admin. Your session might have expired or you do not have sufficient permissions.' 
    });
  }
};

export const superAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.isAdmin && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Super Admin access required' });
  }
};

