import express from 'express';
import { admin, createAdmin, loginAdmin, logoutAdmin } from '../controllers/admin.controller.js';
import { verifyAdminJWT } from '../middleware/admin.auth.middleware.js';

const router = express.Router();

// Route to create a new employee
router.patch('', createAdmin);

router.post('/login', loginAdmin);

router.get('/logout', verifyAdminJWT,logoutAdmin);

router.get('/get', verifyAdminJWT, admin);

export default router;
