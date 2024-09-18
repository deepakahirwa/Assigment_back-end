import express from 'express'
import employeeroutes from './employee.route.js'
import adminRoutes from './admin.route.js'
import { verifyAdminJWT } from '../middleware/admin.auth.middleware.js';
const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
})
router.use('/employee', verifyAdminJWT, employeeroutes);
router.use('/admin', adminRoutes);
export default router;