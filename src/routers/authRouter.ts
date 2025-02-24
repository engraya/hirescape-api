import express from 'express';
const authController = require('../contollers/authController')
const router = express.Router();
import { isAuthenticated } from '../middlewares/isAuthenticated';


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.patch('/send-verification-code',  isAuthenticated, authController.sendVerificationCode);
router.patch('/verify-verification-code',  isAuthenticated, authController.verifyVerificationCode);
router.patch('/change-password',  isAuthenticated, authController.changePassword);
router.patch('/forgot-password',  isAuthenticated, authController.sendForgotPasswordCode);
router.patch('/verify-forgot-password',  isAuthenticated, authController.verifyForgotPasswordCode);


module.exports = router