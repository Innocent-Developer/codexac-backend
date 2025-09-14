import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {User} from '../models/user.model'; // default import, not destructured

interface AuthRequest extends Request {
  user?: any;   // replace `any` with your IUser interface if you have it
  token?: string;
}

const userAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided, please authenticate.' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await User.findById(decoded.id); //  simplified query
    if (!user) {
      res.status(401).json({ error: 'Invalid user, please authenticate.' });
      return;
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed, please login again.' });
  }
};

export default userAuth;
