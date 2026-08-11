import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign({ ...payload }, getSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getSecret()) as JwtPayload;
};
