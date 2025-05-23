import { Package } from "../models/addPackage.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addPackagecontroller = asyncHandler(async (req, res) => {
  const {
    final_price,
    testname,
    testSample,
    pannelname,
    pannelSample,
    packageName,
    packageFee,
    packagegender,
  } = req.body;

  // Check for missing fields
  if (
    !pannelname ||
    !pannelSample ||
    !packageName ||
    !packageFee ||
    !packagegender
  ) {
    return res.status(401).json({message:"missing required feilds"});
  }

  const superAdmin = req.user; // get the super admin id from token
  const userRole = req.user.role; // get the user role from token
  //  // checking if test is allready in database
  const tenantId = req.user.role === "superAdmin" ? null : req.user.tenantId?._id?.toString(); // safe optional chaining

  const allreadyExistedpackage = await Package.findOne({
    packageName: packageName,
    tenantId: tenantId,
  });

  if (allreadyExistedpackage) {
    return res.status(401).json({message:"Package already present in database"});
  }

  // Create the pannel in the database
  const createPackage = {
    testSample,
    testname,
    pannelname,
    pannelSample,
    packageName,
    packageFee,
    final_price,
    packageGender: packagegender,
    createdBy: superAdmin._id, // add the super admin id to the test
    originalTestId: null,
    isBaseTest: true, // Set to true if this is a base test
    createdByRole: userRole, // Add the role of the user creating the test
    purchasedFromBaseTest: false,
    tenantId: tenantId || null, // Set tenantId to null for SuperAdmin tests
  };
  // Set flags based on user role
  if (req.user.role === "superAdmin") {
    createPackage.isBaseTest = true;
    createPackage.tenantId = null;
  } else {
    createPackage.isBaseTest = true; // allow admin/franchise to mark base test
    createPackage.tenantId = req.user.tenantId?._id?.toString(); // safe optional chaining
  }

  const packageCreated = await Package.create(createPackage);

  // Check if the pannel was successfully created
  if (!packageCreated) {
    return res.status(401).json({message:"Something went wrong while creating package"});
  }

  // Send a success response
  return res.status(200).json(
    {message:"package created successfully", package: packageCreated}
  );
});

const allPackagecontroller = asyncHandler(async function (req, res) {
  const allpackages = await Package.find();

  if (!allpackages) {
    throw new ApiError(400, "internal server error");
  }

  return res.json(allpackages);
});

const onePackagecontroller = asyncHandler(async function (req, res) {
  const { value1 } = req.params;

  const Apackage = await Package.findOne({
    _id: value1,
  });

  if (!Apackage) {
    throw new ApiError(400, "internal server error");
  }

  return res.json(Apackage);
});

const editPackageController = asyncHandler(async (req, res) => {
  const { value1 } = req.params;

  const {
    final_price,
    packageName,
    testname,
    testSample,
    pannelname,
    pannelSample,
    packageFee,
    packagegender,
  } = req.body;

  // Check for required fields
  if (!value1) {
    return res.status(401).json({message:"Package name is required"});
  }

  console.log(value1);
  // Find the package by name
  const existingPackage = await Package.findOne({ _id: value1 });

  // If package doesn't exist, throw an error
  if (!existingPackage) {
    return res.status(401).json({message:"Package not found"});
  }

  // Update package details
  existingPackage.testname = testname || existingPackage.testname;
  existingPackage.testSample = testSample || existingPackage.testSample;
  existingPackage.pannelname = pannelname || existingPackage.pannelname;
  existingPackage.pannelSample = pannelSample || existingPackage.pannelSample;
  existingPackage.packageFee = packageFee || existingPackage.packageFee;
  existingPackage.packageGender =
    packagegender || existingPackage.packageGender;
  existingPackage.packageName = packageName || existingPackage.packageName;
  existingPackage.final_price = final_price || existingPackage.final_price;

  // Save the updated package
  const updatedPackage = await existingPackage.save();

  // Return success response
  return res.json(
   {message:"Package Updated successfully", updatedPackage: updatedPackage}
  );
});

const tenantAllPackage = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId._id; // Assuming tenant is logged in
  const createdBy = req.user._id;

  try {
    const packages = await Package.find({
      tenantId: tenantId,
      createdBy: createdBy,
    });

    res.status(200).json({
      status: 200,
      message: "Tests fetched successfully",
      count: packages.length,
      packages,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tests", error: error.message });
  }
});

export {
  addPackagecontroller,
  allPackagecontroller,
  onePackagecontroller,
  editPackageController,
  tenantAllPackage,
};
