import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.model.js";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyAdminJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.adminAccessToken || req.header("Authorization")?.replace("Bearer ", "");
        // console.log(token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const admin = await Admin.findById(decodedToken?._id).select("-refreshToken -password");

        if (!admin) {
            throw new ApiError(401, "Invalid access token");
        }
        // console.log(admin);
        
        req.admin = admin;
        next();
    } catch (error) {
        throw new ApiError(500, error.message || "Error during JWT verification");
    }
});

export { verifyAdminJWT };
