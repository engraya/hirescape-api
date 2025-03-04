import { Request, Response } from 'express';
const { userRegisterSchema, userLoginSchema } = require('../utils/validator');
import User from '../models/userModel';
import { doHash, doHashValidation } from '../utils/hashing';
import jwt from 'jsonwebtoken';

export const register = async (req : Request, res : Response) => {
    const { email, password } = req.body
    try {
        const { error } = userRegisterSchema.validate({ email, password })

        if (error) {
            return res.status(401).json({ success : false, message : error.details[0].message})
        }
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(401).json({ success : false, message : "User already exist..!"})
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = new User({
            email,
            password : hashedPassword
        });
        const result = await newUser.save();
        // @ts-ignore
        result.password = undefined;
        res.status(201).json({
            success : true,
            message : 'User Account created Successfully....!',
            result
        })
    } catch (error) {
        console.log(error)
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Validate incoming data
        const { error } = userLoginSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        // Compare provided password with stored password
        const isPasswordValid = await doHashValidation(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password!' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            process.env.JWT_SECRET as string,  // Use your secret key here
            { expiresIn: '1h' }  // Token expiry time (adjust as needed)
        );

        // Set the JWT token in an HTTP-only cookie
        res.cookie('Authorization', token, {
            httpOnly: true,      // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Only set the cookie over HTTPS in production
            sameSite: 'strict',  // Helps protect against CSRF attacks
            maxAge: 3600000,     // Cookie expires in 1 hour (1h)
            path: '/'            // The cookie is available throughout the application
        });

        // Send the response with the token
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: existingUser._id,
                email: existingUser.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
};

export const logout = async (_req: Request, res: Response) => {
    res.clearCookie('Authorization').status(200).json({ success : true, message : 'User Logged out successfully....!'})
};


// Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve users' });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve user' });
    }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};

