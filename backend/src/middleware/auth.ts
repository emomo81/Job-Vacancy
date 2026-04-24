import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import config from '../config';
import User, { IUser } from '../models/User';
import { fail } from '../utils/apiResponse';

interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return fail(res, 401, 'UNAUTHORIZED', 'Missing authentication token');
  }

  try {
    const payload = jwt.verify(token, config.jwtAccessSecret as Secret) as TokenPayload;
    const user = await User.findById(payload.sub);
    if (!user || user.status !== 'active') {
      return fail(res, 401, 'UNAUTHORIZED', 'Invalid user session');
    }
    req.user = user;
    return next();
  } catch (error) {
    return fail(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}

export function requireRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => Response | void {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return fail(res, 401, 'UNAUTHORIZED', 'Missing user context');
    }
    if (!roles.includes(req.user.role)) {
      return fail(res, 403, 'FORBIDDEN', 'You are not allowed to perform this action');
    }
    return next();
  };
}
