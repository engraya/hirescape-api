import { Request, Response } from 'express';
const { userRegisterSchema, userLoginSchema, forgotPasswordCodeSchema, verifyVerificationCodeSchema, changePasswordSchema } = require('../utils/validator');
import User from '../models/userModel';
import { doHash, doHashValidation } from '../utils/hashing';
import jwt from 'jsonwebtoken';
const transport = require('../utils/sendMail')
import { hmacProcess } from '../utils/hashing';

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
            { userId: existingUser._id, email: existingUser.email, verified : existingUser.verified },
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

export const sendVerificationCode = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        if (existingUser.verified) {
            return res.status(401).json({ success: false, message: 'User already verified!' });
        }

        const verificationCodeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from : process.env.NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS,
            to : existingUser.email,
            subject : 'Verification Code',
            html : '<h1>' + verificationCodeValue + '<h1>'
        })

        if (info.accepted[0] === existingUser.email) {
            const hmacKey = process.env.HMACPROCESS_KEY;
        
            // Check if the key is defined
            if (!hmacKey) {
                return res.status(500).json({
                    success: false,
                    message: 'HMAC process key is not defined in the environment variables.'
                });
            }
            const hashedVerificationCodeValue = hmacProcess(verificationCodeValue, hmacKey);
            existingUser.verificationCode = hashedVerificationCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
        
            return res.status(200).json({
                success: true,
                message: 'Verification Code sent Successfully..!'
            });
        }
        res.status(200).json({ success : false, message : 'Verification Code sent Failed..!'})
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred when sending verification code.' });
    }
};

export const verifyVerificationCode = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    try {

        // Validate incoming data
        const { error } = verifyVerificationCodeSchema.validate({ email, code });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        const codeValue = code.toString();
    
        // Check if user exists
        const existingUser = await User.findOne({ email }).select('+ verificationCode + verificationCodeValidation');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: 'User already verified!' });
        }

        if (!existingUser || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: 'Something went wrong!' });
        }

        if (Date.now() - Number(existingUser.verificationCodeValidation) > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: 'Verification code has expired!' });
        }        

        const hashedVerificationCodeValue = hmacProcess(codeValue, process.env.HMACPROCESS_KEY as string);

        if (hashedVerificationCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save()
            return res.status(200).json({ success: true, message: 'User Acccount verified successfully!' });
        }
        return res.status(400).json({ success: true, message: 'Unexpected Error occured!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred when sending verification code.' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const verified = req.user?.verified; 
    const { oldPassword, newPassword } = req.body;

    try {
        // Validate incoming data
        const { error } = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        if (!verified) {
            return res.status(401).json({ success: false, message: 'User not verified!' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ _id:userId }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        // Compare provided password with stored password
        const passwordResult = await doHashValidation(oldPassword, existingUser.password);
        
        if (!passwordResult) {
            return res.status(401).json({ success: false, message: 'Invalid credentials!' });
        }

        const hashedPassword = await doHash(newPassword, 12);
        existingUser.password  = hashedPassword;
        await existingUser.save();
        return res.status(200).json({ success: true, message: 'Password Changed successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
};


export const sendForgotPasswordCode = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        const verificationCodeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from : process.env.NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS,
            to : existingUser.email,
            subject : 'Forgot Password Code',
            html : '<h1>' + verificationCodeValue + '<h1>'
        })

        if (info.accepted[0] === existingUser.email) {
            const hmacKey = process.env.HMACPROCESS_KEY;
        
            // Check if the key is defined
            if (!hmacKey) {
                return res.status(500).json({
                    success: false,
                    message: 'HMAC process key is not defined in the environment variables.'
                });
            }
            const hashedVerificationCodeValue = hmacProcess(verificationCodeValue, hmacKey);
            existingUser.forgotPasswordCode = hashedVerificationCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
        
            return res.status(200).json({
                success: true,
                message: 'Forgot Password Code sent Successfully..!'
            });
        }
        res.status(200).json({ success : false, message : 'Verification Code sent Failed..!'})
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred when sending verification code.' });
    }
};

export const verifyForgotPasswordCode = async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;

    try {

        // Validate incoming data
        const { error } = forgotPasswordCodeSchema.validate({ email, code, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        const codeValue = code.toString();
    
        // Check if user exists
        const existingUser = await User.findOne({ email }).select('+ forgotPasswordCode + forgotPasswordCodeValidation');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        if (!existingUser || !existingUser.forgotPasswordCodeValidation) {
            return res.status(400).json({ success: false, message: 'Something went wrong!' });
        }

        if (Date.now() - Number(existingUser.forgotPasswordCodeValidation) > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: 'Forgot Password code has expired!' });
        }        

        const hashedVerificationCodeValue = hmacProcess(codeValue, process.env.HMACPROCESS_KEY as string);

        if (hashedVerificationCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save()
            return res.status(200).json({ success: true, message: 'User Acccount Password updated successfully!' });
        }
        return res.status(400).json({ success: true, message: 'Unexpected Error occured!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred when sending verification code.' });
    }
};


