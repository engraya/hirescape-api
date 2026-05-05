"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserById = exports.getAllUsers = exports.logout = exports.login = exports.register = void 0;
const { userRegisterSchema, userLoginSchema } = require('../utils/validator');
const userModel_1 = __importDefault(require("../models/userModel"));
const hashing_1 = require("../utils/hashing");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, confirmPassword } = req.body;
    try {
        // Validate the request body using the updated userRegisterSchema
        const { error } = userRegisterSchema.validate({ email, password, firstName, lastName, confirmPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        // Check if the user already exists
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ success: false, message: 'User already exists..!' });
        }
        // Hash the password
        const hashedPassword = yield (0, hashing_1.doHash)(password, 12);
        // Create a new user instance
        const newUser = new userModel_1.default({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            isAdmin: false // Default is false, but you can customize based on your app
        });
        // Save the new user to the database
        const result = yield newUser.save();
        // Don't return the password in the response
        // @ts-ignore
        result.password = undefined;
        // Send the success response
        res.status(201).json({
            success: true,
            message: 'User account created successfully....!',
            result
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the user.' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { email, password } = req.body;
    try {
        // Validate incoming data
        const { error } = userLoginSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        // Check if user exists
        const existingUser = yield userModel_1.default.findOne({ email }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }
        // Compare provided password with stored password
        const isPasswordValid = yield (0, hashing_1.doHashValidation)(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password!' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: (_a = existingUser.verified) !== null && _a !== void 0 ? _a : false,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Set the JWT token in an HTTP-only cookie
        res.cookie('Authorization', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Only set the cookie over HTTPS in production
            sameSite: 'strict', // Helps protect against CSRF attacks
            maxAge: 3600000, // Cookie expires in 1 hour (1h)
            path: '/' // The cookie is available throughout the application
        });
        // Send the response with the token
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: existingUser._id,
                email: existingUser.email,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                verified: (_b = existingUser.verified) !== null && _b !== void 0 ? _b : false,
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
});
exports.login = login;
const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('Authorization').status(200).json({ success: true, message: 'User Logged out successfully....!' });
});
exports.logout = logout;
// Get all users
const getAllUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all users and populate the 'createdJobs' field with the full job data
        const users = yield userModel_1.default.find().select('-password').populate('createdJobs');
        res.status(200).json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve users' });
    }
});
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.params.id).select('-password').populate('createdJobs');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve user' });
    }
});
exports.getUserById = getUserById;
// Delete a user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield userModel_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});
exports.deleteUser = deleteUser;
