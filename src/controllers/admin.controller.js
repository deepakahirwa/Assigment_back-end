import { Admin } from "../models/Admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import redisClient from '../Service/redis/index.js';



const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await Admin.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        log.error("Error generating tokens:", error);
        throw new ApiError(500, "Internal server error while generating tokens");
    }
};


export const createAdmin = async (req, res) => {
    const {
        name,
        email,
        password,
    } = req.body;
    try {
        // Create new admin
        // console.log(req.body);
        if (!name || !email || !password) {
            throw new ApiError(400, "email password is required")
        }
        const admin = await Admin.create({
            name,
            email,
            password,
        });

        if (!admin) {
            throw new ApiError(500, "Something went wrong with the server");
        }
        return res.status(200).json(new ApiResponse(200, admin, "User registered successfully"));
    } catch (error) {
        console.error("Error while creating admin:", error);
        if (error.name === 'ValidationError') {
            // Handle specific validation error
            return res.status(400).json(new ApiError(400, error.message));
        } else {
            return res.status(500).json(new ApiError(500, error.message || "Something went wrong with the server"));
        }
    }
};


export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json(new ApiError(400, "Please enter email and password"));
    }
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json(new ApiError(401, "Admin does not exist"));
        }

        const isPasswordValid = await admin.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json(new ApiError(401, "Invalid email or password"));
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(admin._id);
        admin.refreshToken = refreshToken;
        await admin.save();

        const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

        // Use "assignment" in the cache key
        const cacheKey = `admin:assignment:${admin._id}`;
        try {
            await redisClient.set(cacheKey, JSON.stringify(loggedInAdmin), 'EX', 60 * 5); // Cache for 5 minutes
            console.log('Admin profile cached successfully in Redis.');
        } catch (redisError) {
            console.error('Error caching admin profile in Redis:', redisError.message);
        }

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        };

        return res.status(200)
            .cookie("adminAccessToken", accessToken, cookieOptions)
            .cookie("adminRefreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200, { user: loggedInAdmin, accessToken, refreshToken }, "Admin logged in successfully"));
    } catch (error) {
        console.error("Error during admin login: ", error.message);
        return res.status(500).json(new ApiError(500, error.message || "Something went wrong with the server"));
    }
};




// Admin logout
export const logoutAdmin = async (req, res) => {

    await Admin.findByIdAndUpdate(
        req.admin._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    };

    return res.status(200)
        .clearCookie("adminAccessToken", options)
        .clearCookie("adminRefreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
};



export const admin = async (req, res) => {
    try {
        // Use "assignment" in the cache key
        const cacheKey = `admin:assignment:${req.admin._id}`;
        const cachedAdmin = await redisClient.get(cacheKey);

        let admin;
        if (cachedAdmin) {
            admin = JSON.parse(cachedAdmin);
            console.log('Admin profile fetched from cache');
        } else {
            admin = await Admin.findById(req.admin._id).select("-password -refreshToken");
            if (!admin) {
                return res.status(404).json(new ApiError(404, "Admin not found"));
            }
            await redisClient.set(cacheKey, JSON.stringify(admin), 'EX', 60 * 60); // Cache for 1 hour
            console.log('Admin profile cached');
        }

        return res.status(200).json(new ApiResponse(200, admin, "Admin fetched successfully"));
    } catch (error) {
        console.error("Error fetching admin profile: ", error.message);
        return res.status(500).json(new ApiError(500, error.message || "Something went wrong with the server"));
    }
};
