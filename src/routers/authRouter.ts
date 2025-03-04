import express from 'express';
const authController = require('../contollers/authController')
const router = express.Router();
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { isAdmin } from '../middlewares/isAdmin';


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/users', isAuthenticated, authController.getAllUsers);
router.get('/users/:id', isAuthenticated, authController.getUserById);
router.delete('/users/:id', isAuthenticated, isAdmin, authController.deleteUser);


module.exports = router