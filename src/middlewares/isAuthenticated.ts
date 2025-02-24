import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    // Get the token from the "Authorization" cookie or header
    const token = req.cookies.Authorization || req.headers['authorization']?.split(' ')[1];


    if (!token) {
        res.status(401).json({ success: false, message: 'UnAuthorized. Please log in to continue.' });
        return;  // Don't return the Response, just end the execution here.
    }

    try {
        // Verify the token using the JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, email: string, verified: boolean };
        
        // Attach user information to the request object for further use in route handlers
        req.user = { 
            userId: decoded.userId, 
            email: decoded.email,
            verified: decoded.verified
        };

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        return;  // End execution after sending response.
    }
};
