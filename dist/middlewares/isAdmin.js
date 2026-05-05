"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
