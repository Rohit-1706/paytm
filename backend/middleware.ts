import type { Request, Response, NextFunction } from 'express';
import JWT_SECRET from './config';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    userId?: string;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message: "Access denied. No valid token provided."
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({
            message: "Access denied. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        return res.status(403).json({
            message: "Access denied. Invalid token."
        });
    }
}

export default authMiddleware;