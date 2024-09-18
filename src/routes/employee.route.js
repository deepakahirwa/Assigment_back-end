import express from 'express';
import { createEmployee, updateEmployee, deleteEmployee, getAllEmployee } from '../controllers/employee.controller.js';
const router = express.Router();
import { upload } from '../middleware/multer.middleware.js';
// Route to create a new employee
router.post('', upload.single("image"), createEmployee);

router.patch('/:id', upload.single("image"), updateEmployee);

router.delete('/:id', deleteEmployee);

router.get('/get', getAllEmployee);

export default router;
