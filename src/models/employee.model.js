import mongoose from 'mongoose';
import { Schema } from 'mongoose';

// Define the Employee schema
const employeeSchema = new Schema({
    f_Id: {
        type: String, // Use String to store custom formatted IDs
        required: true,
        unique: true
    },
    f_Image: {
        type: String,
        required: false,
        trim: true
    },
    f_Name: {
        type: String,
        required: true,
        trim: true
    },
    f_Email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    f_Mobile: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v); // Simple validation for a 10-digit mobile number
            },
            message: props => `${props.value} is not a valid mobile number!`
        }
    },
    f_Designation: {
        type: String,
        required: true,
        trim: true
    },
    f_Gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    f_Course: [{
        type: String,
        required: false,
        trim: true
    }],
    f_Createdate: {
        type: Date,
        default: Date.now
    }
});



// Create the model
const Employee = mongoose.model('Employee', employeeSchema);

export { Employee };
