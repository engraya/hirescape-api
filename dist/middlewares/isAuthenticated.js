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
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Get the token from the "Authorization" cookie or header
        const token = req.cookies.Authorization || ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
        if (!token) {
            res.status(401).json({ success: false, message: 'Unauthorized. Please log in to continue.' });
            return; // Ensure we return void explicitly
        }
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Fetch the user from the database
        const user = yield userModel_1.default.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        // Attach user info to the request object
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            verified: (_c = (_b = decoded.verified) !== null && _b !== void 0 ? _b : user.verified) !== null && _c !== void 0 ? _c : false,
            isAdmin: user.isAdmin,
        };
        // Proceed to the next middleware
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        return;
    }
});
exports.isAuthenticated = isAuthenticated;
