import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

function extractId(id: any): string {
  if (typeof id === 'string') return id;
  if (id?.toHexString) return id.toHexString();
  if (id?.buffer) return Buffer.from(id.buffer).toString('hex');
  return String(id);
}

export interface AuthRequest extends Request {
  user?: { id: string; name: string; email: string };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = {
      id: extractId(session.user.id),
      name: session.user.name ?? '',
      email: session.user.email ?? '',
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (session?.user) {
      req.user = {
        id: extractId(session.user.id),
        name: session.user.name ?? '',
        email: session.user.email ?? '',
      };
    }
    next();
  } catch {
    next();
  }
};
