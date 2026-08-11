import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { Role } from '@prisma/client';

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'You do not have permission to access this resource' });
      return;
    }

    next();
  };
};
