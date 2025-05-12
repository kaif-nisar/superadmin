// middlewares/auth.middleware.js
import { asyncHandler } from "../src/utils/asyncHandler.js";
import { ApiError } from "../src/utils/apiError.js";
import { SuperAdmin } from "../src/models/superAdmin.model.js";
import jwt from "jsonwebtoken";
import { User } from "../src/models/user.model.js";


export const verifySuperAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        
        const decodedToken = jwt.verify(token, process.env.SUPER_ADMIN_ACCESS_TOKEN_SECRET);
        
        const superAdmin = await SuperAdmin.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (!superAdmin) {
            throw new ApiError(401, "Invalid access token");
        }
        
        req.superAdmin = superAdmin;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// import { SuperFranchisee } from "../src/models/superFranchisee.model.js";
// import { Franchiseedb } from "../src/models/franchisee.model.js";
// import { subFranchiseedb } from "../src/models/subFranchisee.model.js";





//agr res ki jarurat nhi hai to use underscore kar de
const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unathorized request")
        }
        const decodedToken = jwt.verify(token, process.env.SUPER_ADMIN_ACCESS_TOKEN_SECRET)

       // let user = await  User.findById(decodedToken?._id).select("-password -refreshToken")
         let user// = await  SuperFranchisee.findById(decodedToken?._id).select("-password -refreshToken")
        
        if (!user) {
            user = await  User.findById(decodedToken?._id).select("-password -refreshToken") .populate("tenantId");
        }

        // if (!user) {
        //     user = await  Franchiseedb.findById(decodedToken?._id).select("-password -refreshToken")
        // }
        // if (!user) {
        //     user = await  subFranchiseedb.findById(decodedToken?._id).select("-password -refreshToken")
        // }
        if (!user) {
            //Todo: discuss about frentend
            throw new ApiError(402, "Invalid Access Token")

        }
        // req.user ke andar user hai or uski whole detail bhi hai
        req.user = user;
        console.log("user", user)
        // ye next ishilye use hota hai kuki ye middleware hai iske baad bhi koi function chalega 
        next()
    } catch (error) {
        throw new ApiError(401, error?.messege || "Invalid Access Token");
    }
})

export { verifyJWT }
