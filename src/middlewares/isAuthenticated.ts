import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the token from the "Authorization" cookie or header
        const token = req.cookies.Authorization || req.headers['authorization']?.split(' ')[1];

        if (!token) {
            res.status(401).json({ success: false, message: 'Unauthorized. Please log in to continue.' });
            return;  // Ensure we return void explicitly
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, email: string, verified: boolean };

        // Fetch the user from the database
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return 
        }

        // Attach user info to the request object
        req.user = { 
            userId: decoded.userId, 
            email: decoded.email,
            verified: decoded.verified,
            isAdmin: user.isAdmin  // Include isAdmin property
        };

        // Proceed to the next middleware
        next();
    } catch (error) {
       res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        return 
    }
};
