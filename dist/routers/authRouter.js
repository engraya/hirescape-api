"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController = require('../controllers/authController');
const router = express_1.default.Router();
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
const isAdmin_1 = require("../middlewares/isAdmin");
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', isAuthenticated_1.isAuthenticated, authController.logout);
router.get('/users', isAuthenticated_1.isAuthenticated, authController.getAllUsers);
router.get('/users/:id', isAuthenticated_1.isAuthenticated, authController.getUserById);
router.delete('/users/:id', isAuthenticated_1.isAuthenticated, isAdmin_1.isAdmin, authController.deleteUser);
module.exports = router;
