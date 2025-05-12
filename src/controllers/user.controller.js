import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Ledger } from "../models/ledger.model.js"
import mongoose from 'mongoose';
import { unitdb } from "../models/category.model.js"
import { User } from "../models/user.model.js";
import { Tenant } from "../models/tenant.model.js";


// generate accessToken and refreshToken for user to close session
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        // save refresh token in data base 

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(501, "something went wrong while generating access and refresh token");
    }

}
// User registration Session 

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, state, city, district, postOffice, pinCode, address, phoneNo, role } = req.body
    if (
        [fullName, email, username, password, phoneNo].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const alreadyExist = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (alreadyExist) {
        throw new ApiError(409, "your username and email already exist")
    }
    const user = await User.create({
        fullName,
        username,
        password,
        email,
        role: 'admin',
        state,
        city,
        district,
        postOffice,
        pinCode,
        address,
        phoneNo,
        wallet: role == 'admin' ? 1000000 : 0,
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong registring the new user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registerd")
    )
})

// User login session

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Ensure either username or email is provided
    if (!(username || email)) {
        return res.status(400).json({ message: "Email or username is required." });
    }

    // Find user by username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    }).populate("tenantId");
    // Check if user exists

     
    if (!user || !(await user.isPasswordCorrect(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
  
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your account is deactivated. Please contact administrator.",
        });
      }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id, user.role);

     // Create user data for frontend
     const userData = {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        modelType: user.tenantId.modelType,
      };

    // Cookie options
    // http secure for secure cookie just database can edit cookie
    const options = {
        httpOnly: true,       // Prevent access to the cookie via JavaScript
        secure: true,         // Set to true in production (for HTTPS)
        sameSite: "none",      // Ensure cross-origin works, 'Lax' for most cases

        // path: '/', 
        // maxAge: 86400000, // 1 day            // Make cookie accessible across the app
        //     httpOnly: true,
        //     secure: false,
        //     secure: process.env.NODE_ENV === 'production',  // Secure in production
    }

    // Set cookies
    res.cookie('refreshToken', refreshToken, options);
    res.cookie('accessToken', accessToken, options);

    // Send response
    return res.status(200).json({
        statusCode: 200,
        accessToken,
        refreshToken,
        userData,
        message: "User logged in successfully",
        success: true
    });
});

//user logout functnality 
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged Out"))
})
// GENRATER ACCESS TOKEN AGAIN BASE ON REFRESH TOKEN FOR LOGIN LAST EVENT
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incommingRefreshToken) {
        throw new ApiError(402, "unathorized access")
    }

    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(402, "invalid refresh Token")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }
        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken:
                            newRefreshToken
                    },
                    "Access Token Refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }

})

// superFranchisee create 
const superFranchiseeCreate = asyncHandler(async (req, res) => {
    try {
        const { username, email, fullName, role, password, phoneNo, address, pinCode, state, city, district, postOffice } = req.body;
        // Get creator's information
        const creator = req.user;
        const tenantId = creator.tenantId;
        console.log("role", role);
        console.log("creator role", creator.role);
        console.log(tenantId.modelType);
        // Check if user has permission to create this role
        const canCreate = checkCreationPermission(creator.role, role, tenantId.modelType);
        console.log("canCreate", canCreate);
        if (!canCreate) {
          return res.status(403).json({
            success: false,
            message: `As a ${creator.role}, you don't have permission to create a ${role}`,
          });
        }
        
        // Check if username or email already exists
        const existingUser = await User.findOne({
          $or: [{ username }, { email }]
        });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Username or Email already exists",
          });
        }
        
        // Create new user
        const newUser = await User.create({
          username,
          email,
          fullName,
          role,
          password,
          phoneNo,
          address,
          pinCode,
          state,
          city,
          district,
          postOffice,
          tenantId: tenantId._id,
          createdBy: creator._id
        });
        
        // Update the creator's createdUsers array
        await User.findByIdAndUpdate(
          creator._id,
          { $push: { createdUsers: newUser._id } }
        );
    
        // Update tenant analytics
        await Tenant.findByIdAndUpdate(
          tenantId._id,
          { $inc: { "analytics.totalUsers": 1 } }
        );
        
        return res.status(201).json({
          success: true,
          message: `${role} created successfully`,
          user: {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            fullName: newUser.fullName
          }
        });
        
      } catch (error) {
        console.error("Create user error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    });
    
    // Helper function to check if user can create specific role
    function checkCreationPermission(creatorRole, newRole, modelType) {
      // Create a hierarchy of roles
      const roleHierarchy = {
        "admin": ["superFranchisee", "franchisee", "subFranchisee"],
        "superFranchisee": ["franchisee", "subFranchisee"],
        "franchisee": ["subFranchisee"],
        "subFranchisee": []
      };
      
      // Check if creator can create this role
      if (!roleHierarchy[creatorRole].includes(newRole)) {
        console.log(`Role ${creatorRole} cannot create ${newRole} we are fail`);
        return false;
      }
      
      // Check model type restrictions
      switch (modelType) {
        case "1layer":
          // Admin can only create regular users, not franchisees
          return false;
        case "2layer":
          // Admin can create superFranchisees only
          return newRole === "superFranchisee";
        case "3layer":
          // Only allow creating roles up to franchisee level
          return newRole !== "superFranchisee";
        case "4layer":
          // All roles can be created
          return true;
        default:
          return false;
      }
    }

const getMyFranchisees = asyncHandler(async (req, res) => {
    // Assuming you have user info in req.user
    const userId = req.query.userId;

    const franchisees = await User.find({ createdBy: userId })
        .select("-password -refreshToken") // Exclude sensitive info
        .populate("createdUsers", "fullName username") // Optionally populate created users

    if (!franchisees.length) {
        return res.status(404).json(new ApiResponse(404, null, "No franchisees found"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true }, franchisees, 'Get franchisee successfully'))
    // return res.status(200).json(new ApiResponse(200, franchisees, "Franchisees retrieved successfully"));
});

// Utility function to generate transaction number

function generateTransactionNumber() {
    const prefix = "#CR";
    const timestamp = Date.now().toString(); // Current timestamp as a unique number
    return prefix + timestamp;
}

// Send money from Admin to Super Franchisee
const moneySendToSuperFranchisee = asyncHandler(async (req, res) => {
    const { adminId, superId, amount } = req.body;

    const admin = await User.findById(adminId);
    const superFranchisee = await User.findById(superId);

    if (!admin || !superFranchisee) {
        return res.status(404).json({ message: 'Admin or Super Franchisee not found' });
    }

    if (admin.wallet < amount) {
        return res.status(400).json({ message: 'Insufficient admin balance' });
    }

    admin.wallet -= amount;
    superFranchisee.wallet += amount;


    await admin.save();
    await superFranchisee.save();

    const transactionNumber = generateTransactionNumber();

    // Create ledger entry for Admin
    await Ledger.create({
        userId: admin._id,
        amount: amount,
        type: 'debit',
        description: `Transferred to Super Franchisee ID: ${superFranchisee._id}`,
        balanceAfterTransaction: admin.wallet,
        transactionId: transactionNumber,
        remarks: `Online payment`,
        username: `${admin.username}/${superFranchisee.username}`

    });

    // Create ledger entry for Super Franchisee
    await Ledger.create({
        userId: superFranchisee._id,
        amount: amount,
        type: 'credit',
        description: `Received from Admin ID: ${admin._id}`,
        balanceAfterTransaction: superFranchisee.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${superFranchisee.username}/${admin.username}`
    });

    return res.status(200).json({ wallet: superFranchisee.wallet });
});

// Send money from Admin to Franchisee
const moneySendToFranchisee = asyncHandler(async (req, res) => {
    const { adminId, franchiseeId, amount } = req.body;
    const admin = await User.findById(adminId);
    const franchisee = await User.findById(franchiseeId);

    if (!admin || !franchisee) {
        return res.status(404).json({ message: 'Admin or Franchisee not found' });
    }

    if (admin.wallet < amount) {
        return res.status(400).json({ message: 'Insufficient admin balance' });
    }

    admin.wallet -= amount;
    franchisee.wallet += amount;

    await admin.save();
    await franchisee.save();

    const transactionNumber = generateTransactionNumber();

    // Create ledger entry for Admin
    await Ledger.create({
        userId: admin._id,
        amount: amount,
        type: 'debit',
        description: `Transferred to Franchisee ID: ${franchisee._id}`,
        balanceAfterTransaction: admin.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${admin.username}/${franchisee.username}`
    });

    // Create ledger entry for Super Franchisee
    await Ledger.create({
        userId: franchisee._id,
        amount: amount,
        type: 'credit',
        description: `Received from Admin ID: ${admin._id}`,
        balanceAfterTransaction: franchisee.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${franchisee.username}/${admin.username}`
    });

    return res.status(200).json({ wallet: franchisee.wallet });
});

// Send money from Admin to Sub Franchisee
const moneySendToSubFranchisee = asyncHandler(async (req, res) => {
    const { adminId, subId, amount } = req.body;
    const admin = await User.findById(adminId);
    const subFranchisee = await User.findById(subId);

    if (!admin || !subFranchisee) {
        return res.status(404).json({ message: 'Admin or Sub Franchisee not found' });
    }

    if (admin.wallet < amount) {
        return res.status(400).json({ message: 'Insufficient admin balance' });
    }

    admin.wallet -= amount;
    subFranchisee.wallet += amount;

    await admin.save();
    await subFranchisee.save();

    const transactionNumber = generateTransactionNumber();

    // Create ledger entry for Admin
    await Ledger.create({
        userId: admin._id,
        amount: amount,
        type: 'debit',
        description: `Transferred to Sub Franchisee ID: ${subFranchisee._id}`,
        balanceAfterTransaction: admin.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${admin.username}/${subFranchisee.username}`
    });

    // Create ledger entry for Super Franchisee
    await Ledger.create({
        userId: subFranchisee._id,
        amount: amount,
        type: 'credit',
        description: `Received from Admin ID: ${admin._id}`,
        balanceAfterTransaction: subFranchisee.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${subFranchisee.username}/${admin.username}`
    });

    return res.status(200).json({ wallet: subFranchisee.wallet });
});

// Debit money from Super Franchisee back to Admin
const moneyDebitFromSuperFranchisee = asyncHandler(async (req, res) => {
    const { adminId, superId, amount } = req.body;

    const admin = await User.findById(adminId);
    const superFranchisee = await User.findById(superId);

    if (!admin || !superFranchisee) {
        return res.status(404).json({ message: 'Admin or Super Franchisee not found' });
    }

    superFranchisee.wallet -= amount; // Reduce from Super Franchisee
    admin.wallet += amount; // Add to Admin

    await admin.save();
    await superFranchisee.save();

    const transactionNumber = generateTransactionNumber();

    // Create ledger entry for Admin (Credit)
    await Ledger.create({
        userId: admin._id,
        amount: amount,
        type: 'credit',
        description: `Received from Super Franchisee ID: ${superFranchisee._id}`,
        balanceAfterTransaction: admin.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${admin.username}/${superFranchisee.username}`
    });

    // Create ledger entry for Super Franchisee (Debit)
    await Ledger.create({
        userId: superFranchisee._id,
        amount: amount,
        type: 'debit',
        description: `Transferred to Admin ID: ${admin._id}`,
        balanceAfterTransaction: superFranchisee.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${superFranchisee.username}/${admin.username}`
    });

    return res.status(200).json({ wallet: admin.wallet });
});

// Debit money from Franchisee back to Admin
const moneyDebitFromFranchisee = asyncHandler(async (req, res) => {
    const { adminId, franchiseeId, amount } = req.body;
    const admin = await User.findById(adminId);
    const franchisee = await User.findById(franchiseeId);

    if (!admin || !franchisee) {
        return res.status(404).json({ message: 'Admin or Franchisee not found' });
    }

    franchisee.wallet -= amount; // Reduce from Franchisee
    admin.wallet += amount; // Add to Admin

    await admin.save();
    await franchisee.save();

    const transactionNumber = generateTransactionNumber();

    // Create ledger entry for Admin (Credit)
    await Ledger.create({
        userId: admin._id,
        amount: amount,
        type: 'credit',
        description: `Received from Franchisee ID: ${franchisee._id}`,
        balanceAfterTransaction: admin.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${admin.username}/${franchisee.username}`
    });

    // Create ledger entry for Super Franchisee (Debit)
    await Ledger.create({
        userId: franchisee._id,
        amount: amount,
        type: 'debit',
        description: `Transferred to Admin ID: ${admin._id}`,
        balanceAfterTransaction: franchisee.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${franchisee.username}/${admin.username}`
    });

    return res.status(200).json({ wallet: admin.wallet });
});

// Debit money from Sub Franchisee back to Admin
const moneyDebitFromSubFranchisee = asyncHandler(async (req, res) => {
    const { adminId, subId, amount } = req.body;
    const admin = await User.findById(adminId);
    const subFranchisee = await User.findById(subId);

    if (!admin || !subFranchisee) {
        return res.status(404).json({ message: 'Admin or Sub Franchisee not found' });
    }

    subFranchisee.wallet -= amount; // Reduce from Sub Franchisee
    admin.wallet += amount; // Add to Admin

    await admin.save();
    await subFranchisee.save();

    const transactionNumber = generateTransactionNumber();

    // Create ledger entry for Admin (Credit)
    await Ledger.create({
        userId: admin._id,
        amount: amount,
        type: 'credit',
        description: `Received from Super Franchisee ID: ${subFranchisee._id}`,
        balanceAfterTransaction: admin.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${admin.username}/${subFranchisee.username}`
    });

    // Create ledger entry for Super Franchisee (Debit)
    await Ledger.create({
        userId: subFranchisee._id,
        amount: amount,
        type: 'debit',
        description: `Transferred to Admin ID: ${admin._id}`,
        balanceAfterTransaction: subFranchisee.wallet,
        transactionId: transactionNumber,
        remarks: `Online Payment`,
        username: `${subFranchisee.username}/${admin.username}`
    });

    return res.status(200).json({ wallet: admin.wallet });
});

// fetch  all franchisee
const fetchAllFranchisee = asyncHandler(async (req, res) => {

    const franchisee = await User.find({})

    if (!franchisee) return new ApiError(404, "Franchisee not found")

    return res.status(200).json(new ApiResponse(200, franchisee, "Franchisee"))
})

const amountUpdate = asyncHandler(async (req, res) => {
     // Log userId
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(403).send('User not found');

        res.json({ wallet: user.wallet });
    } catch (error) {
        throw new ApiError(500, "something went wrong fetching amount")
    }
});

const getFilteredTransactionHistory = asyncHandler(async (req, res) => {
    const { startDate, endDate, transactionType, userId, timeStamp } = req.query;
    // Validate userId

    const filter = { userId: new mongoose.Types.ObjectId(userId) };

    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    else {
        // Correctly set the date range to the past 7 days
        const now = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(now.getDate() - 1);

        if (timeStamp) {
            pastWeek.setDate(now.getDate() - timeStamp);
        }

        // Subtract 7 days from the current date



        filter.createdAt = {
            '$gte': pastWeek,
            '$lte': now
        };
    }
    if (transactionType) {
        filter.type = transactionType;
    }
    // Find transactions that match the filter
    // Add remarks filter for "Online Payment"
    filter.remarks = "Online Payment";
    // Fetch filtered transactions
    const transactions = await Ledger.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

    // Check for missing transactionId and update in bulk
    const transactionsToUpdate = [];
    transactions.forEach(transaction => {
        if (!transaction.transactionId) {
            transaction.transactionId = generateTransactionNumber();
            transactionsToUpdate.push(transaction);
        }
    });

    // Save all updated transactions if there are any missing transactionIds
    if (transactionsToUpdate.length > 0) {
        await Ledger.bulkWrite(
            transactionsToUpdate.map(tx => ({
                updateOne: {
                    filter: { _id: tx._id },
                    update: { transactionId: tx.transactionId }
                }
            }))
        );
    }

    return res.status(200).json({ transactions });
});

const addUnit = asyncHandler(async (req, res) => {
    const { unit } = req.body
    const unitExists = await unitdb.findOne({ unit });
    if (unitExists) {
        throw new ApiError('Unit already exists');
    }
    const newUnit = new unitdb({ unit });
    await newUnit.save();

    return res.status(201).json({ unit: newUnit.unit });

})

const getUnits = asyncHandler(async (req, res) => {

    const units = await unitdb.find().sort({ unit: 1 });

    return res.status(200).json({ units });
})

const verifyPin = asyncHandler(async (req, res) => {
    const { pin } = req.body;
    if (pin === "3399") {
        return res.json({ success: true, message: "PIN Verified" });
    } else {
        return res.status(401).json({ success: false, message: "Incorrect PIN" });
    }
});



// Get dashboard data based on user role and tenant model
export const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const tenantId = user.tenantId;
    
    // Basic stats for all roles
    const stats = {
      role: user.role,
      modelType: tenantId.modelType
    };
    
    // Get user hierarchy data
    const hierarchyData = await getUserHierarchyStats(user._id, user.role, tenantId.modelType);
    
    // Get permissions based on role and model type
    const permissions = getPermissions(user.role, tenantId.modelType);
    
    // Combine all data
    const dashboardData = {
      userInfo: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        wallet: user.wallet
      },
      tenantInfo: {
        name: tenantId.name,
        modelType: tenantId.modelType,
        code: tenantId.code,
        status: tenantId.status
      },
      stats: hierarchyData,
      permissions
    };
    
    return res.status(200).json({
      success: true,
      dashboardData
    });
    
  } catch (error) {
    console.error("Dashboard data error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Helper function to get user hierarchy statistics
async function getUserHierarchyStats(userId, role, modelType) {
  const stats = {};
  
  // Count direct users created by this user
  const userCounts = await User.aggregate([
    { $match: { createdBy: userId } },
    { $group: { _id: "$role", count: { $sum: 1 } } }
  ]);
  
  // Initialize counts for all possible roles
  stats.superFranchisees = 0;
  stats.franchisees = 0;
  stats.subFranchisees = 0;
  
  // Update with actual counts
  userCounts.forEach(item => {
    if (item._id === "superFranchisee") stats.superFranchisees = item.count;
    if (item._id === "franchisee") stats.franchisees = item.count;
    if (item._id === "subFranchisee") stats.subFranchisees = item.count;
  });
  
  // Get total users in hierarchy (direct and indirect)
  const createdUsers = await User.find({ createdBy: userId });
  let totalIndirectUsers = 0;
  
  // Count indirect users (users created by direct users)
  for (const user of createdUsers) {
    const indirectCount = await User.countDocuments({ createdBy: user._id });
    totalIndirectUsers += indirectCount;
  }
  
  stats.directUsers = createdUsers.length;
  stats.indirectUsers = totalIndirectUsers;
  stats.totalUsers = stats.directUsers + stats.indirectUsers;
  
  return stats;
}

// Helper function to determine user permissions based on role and model type
function getPermissions(role, modelType) {
  const permissions = {
    canCreateSuperFranchisee: false,
    canCreateFranchisee: false,
    canCreateSubFranchisee: false,
    canViewAnalytics: false,
    canManageTests: false,
    canManagePayments: false
  };
  
  // Set permissions based on role
  switch (role) {
    case "admin":
      permissions.canViewAnalytics = true;
      permissions.canManageTests = true;
      permissions.canManagePayments = true;
      
      // Model-specific permissions for admin
      if (modelType === "2layer" || modelType === "3layer" || modelType === "4layer") {
        permissions.canCreateFranchisee = true;
      }
      
      if (modelType === "3layer" || modelType === "4layer") {
        permissions.canCreateSuperFranchisee = true;
      }
      break;
      
    case "superFranchisee":
      permissions.canViewAnalytics = true;
      permissions.canManagePayments = true;
      
      // Model-specific permissions for superFranchisee
      if (modelType === "3layer" || modelType === "4layer") {
        permissions.canCreateFranchisee = true;
      }
      
      if (modelType === "4layer") {
        permissions.canCreateSubFranchisee = true;
      }
      break;
      
    case "franchisee":
      permissions.canViewAnalytics = true;
      
      // Model-specific permissions for franchisee
      if (modelType === "4layer") {
        permissions.canCreateSubFranchisee = true;
      }
      break;
      
    case "subFranchisee":
      // SubFranchisee has limited permissions
      break;
  }
  
  return permissions;
}

export {
    registerUser, loginUser, logOutUser,
    refreshAccessToken, superFranchiseeCreate, moneySendToFranchisee
    , moneySendToSubFranchisee, moneySendToSuperFranchisee, amountUpdate, getMyFranchisees, fetchAllFranchisee, moneyDebitFromSuperFranchisee,
    moneyDebitFromFranchisee, moneyDebitFromSubFranchisee, getFilteredTransactionHistory, addUnit, getUnits,verifyPin
}
