import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.isAdmin) {
        res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        return
    }
    next();
};
