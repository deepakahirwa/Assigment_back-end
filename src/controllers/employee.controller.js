import { Employee } from '../models/employee.model.js'; // Adjust path to your Employee model
import { ApiError } from '../utils/ApiError.js'; // Adjust path to your custom ApiError class
import { ApiResponse } from '../utils/ApiResponse.js'; // Adjust path to your custom ApiResponse class
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import fs from 'fs'

export const createEmployee = asyncHandler(async (req, res) => {
    const {
        f_Name,
        f_Email,
        f_Mobile,
        f_Designation,
        f_Gender,
        f_Course,
    } = req.body;
    console.log(req.body)
    const imagePath = req.file?.path;
    try {
        // Basic validation
        if (!f_Name || !f_Email || !f_Mobile || !f_Designation || !f_Gender) {
            throw new ApiError(400, 'Required fields are missing', [], "");
        }

        // Validate email and mobile number formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^\d{10}$/;

        if (!emailRegex.test(f_Email)) {
            fs.unlinkSync(imagePath);
            throw new ApiError(400, 'Invalid email format', [], "");
        }

        if (!mobileRegex.test(f_Mobile)) {
            fs.unlinkSync(imagePath);
            throw new ApiError(400, 'Invalid mobile number format', [], "");

        }

        // Check if employee already exists with the same email or mobile number
        const existingEmployee = await Employee.findOne({
            $or: [{ f_Email: f_Email }, { f_Mobile: f_Mobile }]
        });

        if (existingEmployee) {
            fs.unlinkSync(imagePath);
            throw new ApiError(409, 'Employee already exists with this email or mobile number', [], "");

        }
        const lastEmployee = await Employee.findOne().sort({ f_Id: -1 }).limit(1);
        let f_Id;
        if (lastEmployee) {
            const lastId = lastEmployee.f_Id;
            const lastIdNum = parseInt(lastId.substr(3, 3));

            const newIdNum = lastIdNum + 1;
            f_Id = `EMY${newIdNum.toString().padStart(3, '0')}`;
        } else {
            f_Id = "EMP001";
        }
        // Upload image if exists

        console.log(imagePath);
        const image = await uploadOnCloudinary(imagePath);
        
        if (!image || !image.url) {
            throw new ApiError(400, "Avatar is required for registration", [], "");
        }
        const employee = await Employee.create({
            f_Id,
            f_Name,
            f_Email,
            f_Mobile,
            f_Designation,
            f_Gender,
            f_Course,
            f_Image: image.url
        });

        if (!employee) {
            throw new ApiError(500, 'Something went wrong while creating the employee');
        }

        return res.status(201).json(new ApiResponse(201, employee, 'Employee created successfully'));
    } catch (error) {
        console.error('Error while creating employee:', error);

        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiError(error.statusCode, error.message));
        } else if (error.name === 'ValidationError') {
            return res.status(400).json(new ApiError(400, error.message));
        } else {
            return res.status(500).json(new ApiError(500, error.message || 'Something went wrong with the server'));
        }
    }
})


export const updateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params; // Employee ID from route parameters
    const {
        f_Name,
        f_Email,
        f_Mobile,
        f_Designation,
        f_Gender,
        f_Course,
        f_Image
    } = req.body;
    // console.log(req.body);
    let Image = f_Image;
    const imagePath = req.file?.path;
    try {

        if (!f_Name && !f_Email && !f_Mobile && !f_Designation && !f_Gender && !f_Course && !f_Image) {
            throw new ApiError(400, 'No fields provided for update');
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^\d{10}$/;

        if (f_Email && !emailRegex.test(f_Email)) {
            fs.unlinkSync(imagePath);
            throw new ApiError(400, 'Invalid email format');
        }

        if (f_Mobile && !mobileRegex.test(f_Mobile)) {
            fs.unlinkSync(imagePath);
            throw new ApiError(400, 'Invalid mobile number format');
        }

        // Find the existing employee
        const employee = await Employee.findById(id);

        if (!employee) {
            fs.unlinkSync(imagePath);
            throw new ApiError(404, 'Employee not found');
        }

        // Check if the new email or mobile number already exists for another employee
        const existingEmployee = await Employee.findOne({
            $or: [
                { f_Email: f_Email },
                { f_Mobile: f_Mobile }
            ]
        });

        if (existingEmployee && existingEmployee._id.toString() !== id) {
            fs.unlinkSync(imagePath);
            throw new ApiError(409, 'Email or mobile number already in use', [], "");
        }

        if (imagePath) {
            // Upload image if exists

            const image = await uploadOnCloudinary(imagePath);
            if (!image || !image.url) {
                throw new ApiError(400, "Avatar is required for registration", [], "");
            }
            Image = image.url;
        }
        if (f_Name) employee.f_Name = f_Name;
        if (f_Email) employee.f_Email = f_Email;
        if (f_Mobile) employee.f_Mobile = f_Mobile;
        if (f_Designation) employee.f_Designation = f_Designation;
        if (f_Gender) employee.f_Gender = f_Gender;
        if (f_Course) employee.f_Course = f_Course;
        if (f_Image) employee.f_Image = Image;


        await employee.save();

        return res.status(200).json(new ApiResponse(200, employee, 'Employee updated successfully'));
    } catch (error) {
        console.error('Error while updating employee:', error);

        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiError(error.statusCode, error.message));
        } else if (error.name === 'ValidationError') {
            return res.status(400).json(new ApiError(400, error.message));
        } else {
            return res.status(500).json(new ApiError(500, error.message || 'Something went wrong with the server'));
        }
    }
})



export const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the employee by ID
        const employee = await Employee.findById(id);

        if (!employee) {
            throw new ApiError(404, 'Employee not found');
        }


        await Employee.findByIdAndDelete(id);

        return res.status(200).json(new ApiResponse(200, null, 'Employee deleted successfully'));
    } catch (error) {
        console.error('Error while deleting employee:', error);

        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiError(error.statusCode, error.message));
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json(new ApiError(400, 'Invalid employee ID'));
        } else {
            return res.status(500).json(new ApiError(500, error.message || 'Something went wrong with the server'));
        }
    }
};



export const getAllEmployee = async (req, res) => {

    try {
        // Find the employee by ID
        const employee = await Employee.find();

        if (!employee) {
            throw new ApiError(404, 'Employee not found');
        }




        return res.status(200).json(new ApiResponse(200, employee, 'Employee deleted successfully'));
    } catch (error) {
        console.error('Error while deleting employee:', error);

        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiError(error.statusCode, error.message));
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json(new ApiError(400, 'Invalid employee ID'));
        } else {
            return res.status(500).json(new ApiError(500, error.message || 'Something went wrong with the server'));
        }
    }
};
