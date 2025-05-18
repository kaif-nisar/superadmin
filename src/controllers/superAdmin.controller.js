// superAdmin.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { SuperAdmin } from "../models/superAdmin.model.js";
import { Tenant } from "../models/tenant.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// SuperAdmin Auth Controllers
export const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, fullName, phone } = req.body;
  console.log("Registering Super Admin:", req.body);

  // Validate required fields
  if (!username || !email || !password || !fullName || !phone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Check if super admin already exists
  const existingSuperAdmin = await SuperAdmin.findOne({
    $or: [{ username }, { email }],
  });

  if (existingSuperAdmin) {
    return res.status(409).json({
      success: false,
      message: "Super Admin with this username or email already exists",
    });
  }

  // Create super admin
  const superAdmin = await SuperAdmin.create({
    username,
    email,
    password,
    fullName,
    phoneNo: phone,
  });

  console.log("Super Admin Created:", superAdmin);

  const createdSuperAdmin = await SuperAdmin.findById(superAdmin._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json({
    success: true,
    message: "Super Admin registered successfully",
    superAdmin: createdSuperAdmin,
  });
});

export const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email) || !password) {
    return res.status(400).json({
      success: false,
      message: "Username/email and password are required",
    });
  }

  // Find super admin
  const superAdmin = await SuperAdmin.findOne({
    $or: [{ username }, { email }],
  });

  if (!superAdmin) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check password
  const isPasswordValid = await superAdmin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Generate tokens
  const accessToken = superAdmin.generateAccessToken();
  const refreshToken = superAdmin.generateRefreshToken();

  // Update refresh token in database
  superAdmin.refreshToken = refreshToken;
  superAdmin.lastLogin = new Date();
  await superAdmin.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      message: "Super Admin logged in successfully",
      superAdmin: {
        _id: superAdmin._id,
        username: superAdmin.username,
        email: superAdmin.email,
        fullName: superAdmin.fullName,
      },
      accessToken,
    });
});

// टेनेंट मैनेजमेंट कंट्रोलर
export const createTenant = asyncHandler(async (req, res) => {
  // Extract all details from request body
  const { name, modelType, adminDetails, subscriptionPlan, addressDetails } =
    req.body;

  // Validate required fields
  if (
    !name ||
    !modelType ||
    !adminDetails ||
    !subscriptionPlan ||
    !addressDetails
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }
  // Check if requesting user is a superadmin
  const requestingUser = req.user;
  console.log("Requesting User:", requestingUser.role);
  if (requestingUser.role !== "superAdmin") {
    throw new ApiError(403, "Only superadmins can assign tenants");
  }
  // Check if email or username already exists
  const existingUser = await User.findOne({
    $or: [{ email: adminDetails.email }, { username: adminDetails.username }],
  });
  console.log("Existing User:", existingUser);
  if (existingUser) {
    throw new ApiError(409, "Email or username already exists");
  }

  // Create unique code for tenant
  const code =
    name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);

  // Transaction to create tenant and admin
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create tenant
    const tenant = await Tenant.create(
      [
        {
          name,
          modelType,
          code,
          status: "active",
          adminDetails: {
            email: adminDetails.email,
            username: adminDetails.username,
          },
          subscriptionPlan: {
            planType: subscriptionPlan.planType || "monthly",
            startDate: subscriptionPlan.startDate || new Date(),
            endDate: subscriptionPlan.endDate,
            price: subscriptionPlan.price,
            paymentStatus: subscriptionPlan.paymentStatus || "pending",
          },
        },
      ],
      { session }
    );
    console.log(adminDetails, "Admin Details:");
    console.log(addressDetails, "Address Details:");

    // Create admin user for tenant
    const admin = await User.create(
      [
        {
          username: adminDetails.username,
          email: adminDetails.email,
          fullName: addressDetails.fullName,
          password: adminDetails.password,
          role: "admin",
          wallet: 1000000,
          phoneNo: addressDetails.phoneNo,
          state: addressDetails.state,
          district: addressDetails.district,
          pinCode: addressDetails.pincode,
          address: addressDetails.address,
          createdBy: requestingUser._id,
          tenantId: tenant[0]._id,
          hierarchyPath: "/",
          isActive: true,
          pdfFormat: addressDetails.pdfFormat || "reportFormat1.html"
        },
      ],
      { session }
    );
    console.log("Admin Created:", admin);
    // Update tenant with admin user ID
    tenant[0].adminDetails.userId = admin[0]._id;
    await tenant[0].save({ session });

    // Add this new user to the creator's createdUsers array
    await User.findByIdAndUpdate(requestingUser._id, {
      $push: { createdUsers: admin[0]._id },
    });

    // Ensure wallet is a number (if it's not already)
   // Ensure wallet is a number (if it's not already)
const currentWallet = Number(requestingUser.wallet) || 0; // Default to 0 if not a number

// Record transaction in superadmin's ledger if payment is made
if (subscriptionPlan.paymentStatus === "paid") {
  await User.findByIdAndUpdate(requestingUser._id, {
    $push: {
      ledger: {
        transactionId: `TXN-${Date.now()}`, // Ensure the format is correct
        type: "credit",
        amount: subscriptionPlan.price,
        description: `Tenant subscription payment from ${name}`,
        balanceAfterTransaction: currentWallet + subscriptionPlan.price,
      },
    },
    $inc: { wallet: subscriptionPlan.price }, // Increment the wallet by the price
  });
}


    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Tenant created successfully with admin user",
      tenant: {
        _id: tenant[0]._id,
        name: tenant[0].name,
        modelType: tenant[0].modelType,
        code: tenant[0].code,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: "Failed to create tenant",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

// const assignTenant = asyncHandler(async (req, res) => {
//   // Extract all details from request body
//   const {
//     name,
//     modelType,
//     code,
//     adminDetails,
//     subscriptionPlan,
//     addressDetails,
//   } = req.body;

//   // Validate required fields
//   if (
//     !name ||
//     !modelType ||
//     !adminDetails ||
//     !subscriptionPlan ||
//     !addressDetails
//   ) {
//     throw new ApiError(400, "All required fields must be provided");
//   }

//   // Check if requesting user is a superadmin
//   const requestingUser = req.user;
//   if (requestingUser.role !== "admin") {
//     throw new ApiError(403, "Only superadmins can assign tenants");
//   }

//   // Generate franchise code if not provided
//   const tenantCode = code || `FRANCHISE-${Date.now()}`;

//   // Check if email or username already exists
//   const existingUser = await User.findOne({
//     $or: [{ email: adminDetails.email }, { username: adminDetails.username }],
//   });

//   if (existingUser) {
//     throw new ApiError(409, "Email or username already exists");
//   }

//   // Create new admin user
//   const newAdmin = await User.create({
//     username: adminDetails.username,
//     email: adminDetails.email,
//     fullName: addressDetails.fullName,
//     password: adminDetails.password,
//     role: "admin",
//     phoneNo: addressDetails.phoneNo,
//     state: addressDetails.state,
//     district: addressDetails.district,
//     pinCode: addressDetails.pincode,
//     address: addressDetails.address,
//     createdBy: requestingUser._id,
//     isActive: true,
//   });

//   if (!newAdmin) {
//     throw new ApiError(500, "Failed to create admin user");
//   }

//   // Create new tenant
//   const newTenant = await Tenant.create({
//     name,
//     modelType,
//     code: tenantCode,
//     admin: newAdmin._id,
//     subscription: {
//       planType: subscriptionPlan.planType || "monthly",
//       startDate: subscriptionPlan.startDate || new Date(),
//       endDate: subscriptionPlan.endDate,
//       price: subscriptionPlan.price,
//       paymentStatus: subscriptionPlan.paymentStatus || "pending",
//     },
//   });

//   if (!newTenant) {
//     // Rollback user creation if tenant creation fails
//     await User.findByIdAndDelete(newAdmin._id);
//     throw new ApiError(500, "Failed to create tenant");
//   }

//   // Add this new user to the creator's createdUsers array
//   await User.findByIdAndUpdate(requestingUser._id, {
//     $push: { createdUsers: newAdmin._id },
//   });

//   // Record transaction in superadmin's ledger if payment is made
//   if (subscriptionPlan.paymentStatus === "paid") {
//     await User.findByIdAndUpdate(requestingUser._id, {
//       $push: {
//         ledger: {
//           transactionId: `TXN-${Date.now()}`,
//           type: "credit",
//           amount: subscriptionPlan.price,
//           description: `Tenant subscription payment from ${name}`,
//           balanceAfterTransaction:
//             requestingUser.wallet + subscriptionPlan.price,
//         },
//       },
//       $inc: { wallet: subscriptionPlan.price },
//     });
//   }

//   // Return success response with tenant and admin details
//   return res.status(201).json(
//     new ApiResponse(
//       201,
//       {
//         tenant: newTenant,
//         admin: {
//           _id: newAdmin._id,
//           username: newAdmin.username,
//           email: newAdmin.email,
//           fullName: newAdmin.fullName,
//           role: newAdmin.role,
//         },
//       },
//       "Franchise model assigned successfully"
//     )
//   );
// });

// Get all tenants (for superadmin)
const getAllTenants = asyncHandler(async (req, res) => {
  // Check if requesting user is a superadmin
  const requestingUser = req.user;
  if (requestingUser.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const tenants = await Tenant.find().populate({
    path: "admin",
    select: "username email fullName",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tenants, "Tenants fetched successfully"));
});

// Get tenant by ID
const getTenantById = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;

  if (!tenantId) {
    throw new ApiError(400, "Tenant ID is required");
  }

  const tenant = await Tenant.findById(tenantId).populate({
    path: "admin",
    select: "username email fullName phoneNo state district pinCode address",
  });

  if (!tenant) {
    throw new ApiError(404, "Tenant not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tenant, "Tenant fetched successfully"));
});

// Update tenant subscription
const updateTenantSubscription = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const { planType, endDate, price, paymentStatus } = req.body;

  if (!tenantId) {
    throw new ApiError(400, "Tenant ID is required");
  }

  // Check if requesting user is a superadmin
  const requestingUser = req.user;
  if (requestingUser.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new ApiError(404, "Tenant not found");
  }

  // Update subscription details
  const updatedTenant = await Tenant.findByIdAndUpdate(
    tenantId,
    {
      "subscription.planType": planType || tenant.subscription.planType,
      "subscription.endDate": endDate || tenant.subscription.endDate,
      "subscription.price": price || tenant.subscription.price,
      "subscription.paymentStatus":
        paymentStatus || tenant.subscription.paymentStatus,
    },
    { new: true }
  );

  // Record transaction if payment status changed to paid
  if (
    paymentStatus === "paid" &&
    tenant.subscription.paymentStatus !== "paid"
  ) {
    await User.findByIdAndUpdate(requestingUser._id, {
      $push: {
        ledger: {
          transactionId: `TXN-${Date.now()}`,
          type: "credit",
          amount: price || tenant.subscription.price,
          description: `Tenant subscription payment from ${tenant.name}`,
          balanceAfterTransaction:
            requestingUser.wallet + (price || tenant.subscription.price),
        },
      },
      $inc: { wallet: price || tenant.subscription.price },
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedTenant,
        "Tenant subscription updated successfully"
      )
    );
});

// Deactivate tenant
const deactivateTenant = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;

  if (!tenantId) {
    throw new ApiError(400, "Tenant ID is required");
  }

  // Check if requesting user is a superadmin
  const requestingUser = req.user;
  if (requestingUser.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const updatedTenant = await Tenant.findByIdAndUpdate(
    tenantId,
    { isActive: false },
    { new: true }
  );

  if (!updatedTenant) {
    throw new ApiError(404, "Tenant not found");
  }

  // Also deactivate the admin user
  await User.findByIdAndUpdate(updatedTenant.admin, { isActive: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTenant, "Tenant deactivated successfully")
    );
});

export {
  // l
  getAllTenants,
  getTenantById,
  updateTenantSubscription,
  deactivateTenant,
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// अन्य कंट्रोलर्स...
