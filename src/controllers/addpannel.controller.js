import { addPannel } from "../models/AddPannel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { pannelCounter } from "../models/counterPannel.model.js";
import mongoose from "mongoose";

const getNextSequenceValue = async (counterName) => {
  const counter = await pannelCounter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { sequenceValue: 1 } }, // Increment sequenceValue by 1
    { new: true, upsert: true } // Create if not exists and return the updated document
  );

  if (!counter) {
    throw new Error(
      `Failed to retrieve or create counter with name: ${counterName}`
    );
  }

  return counter.sequenceValue;
};

const addpannelcontroller = asyncHandler(async (req, res) => {
  const {
    pannelname,
    category,
    price: rawPrice,
    inputarray,
    interpretion,
    sample_types,
    hideInterpretation,
    hideMethodInstrument,
    final_price,
  } = req.body;

    // Check for missing fields
  if (!pannelname || !category || !final_price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const superAdmin = req.user; // get the super admin id from token
  const userRole = req.user.role; // get the user role from token

  //  // checking if test is allready in database
  const tenantId = req.user.role === "superAdmin" ? null : req.user.tenantId?._id?.toString(); // safe optional chaining

  const allreadyExistedpannel = await addPannel.findOne({
    name: pannelname,
    tenantId: tenantId,
  });

  if (allreadyExistedpannel) {
    return res
      .status(400)
      .json({ message: "Pannel already exists in database" });
  }

  const price = Number(rawPrice); // Convert the price to a number

  // Get the next order number
  const nextOrder = await getNextSequenceValue("orderCounter");

  // Create the pannel in the database
  const createPannel = {
    order: nextOrder,
    name: pannelname,
    category,
    price,
    tests: inputarray,
    interpretation: interpretion,
    sample_types,
    hideInterpretation,
    hideMethodInstrument,
    final_price,
    createdBy: superAdmin._id, // add the super admin id to the test
    originalTestId: null,
    isBaseTest: true, // Set to true if this is a base test
    createdByRole: userRole, // Add the role of the user creating the test
    purchasedFromBaseTest: false,
    tenantId: null, // Set tenantId to null for SuperAdmin tests
  };

  // Set flags based on user role
  if (req.user.role === "superAdmin") {
    createPannel.isBaseTest = true;
    createPannel.tenantId = null;
  } else {
    createPannel.isBaseTest = true; // allow admin/franchise to mark base test
    createPannel.tenantId = req.user.tenantId?._id?.toString(); // safe optional chaining
  }

  const panelCreated = await addPannel.create(createPannel);

  // Check if the pannel was successfully created
  if (!panelCreated) {
    return res.status(400).json({ message: "Failed to create pannel" });
  }

  // Send a success response
  return res.status(200).json(
    { message: "Pannel created successfully", panelCreated, status:"success" }
  );
});

const allPannelcontroller = asyncHandler(async function (req, res) {
  const allpanels = await addPannel.find();

  if (!allpanels) {
    throw new ApiError(400, "internal server error");
  }

  return res.json(allpanels);
});

const onePannelcontroller = asyncHandler(async function (req, res) {
  const { value1 } = req.params;
  console.log(value1);
  const Apannel = await addPannel.findOne({
    _id: value1,
  });

  if (!Apannel) {
    throw new ApiError(400, "internal server error");
  }

  return res.json(Apannel);
});

const editPannelController = asyncHandler(async (req, res) => {
  const { value1 } = req.params;

  const {
    final_price,
    pannelname,
    category,
    price,
    inputarray,
    sample_types,
    interpretion,
    hideInterpretation,
    hideMethodInstrument,
  } = req.body;

  if (!final_price || !pannelname || !category || !price) {
    return res.status(401).json({ message: "missing required feilds", status: "error" })
  }

  const editedPannel = await addPannel.findOneAndUpdate(
    {
      _id: value1,
    },
    {
      name: pannelname,
      category,
      price,
      tests: inputarray,
      sample_types,
      interpretation: interpretion,
      hideInterpretation,
      hideMethodInstrument,
      final_price,
    },
    { new: true }
  );

  if (!editedPannel) {
    return res.status(401).json({ message: "Something went wrong, please try again", status: "error" })
  }

  return res.status(200).json({ message: "panel edited successfully", status: "success", edited: editedPannel })
});

const updatePannelOrder = asyncHandler(async (req, res) => {
  const { updatedOrder } = req.body;
  console.log(updatedOrder);

  if (!Array.isArray(updatedOrder) || updatedOrder.length === 0) {
    throw new ApiError(400, "Invalid or empty order data");
  }

  try {
    const bulkOperations = await Promise.all(
      updatedOrder.map(async (orderData) => {
        let { id, order } = orderData;

        // If id is a valid MongoDB ObjectId, use it directly
        if (mongoose.isValidObjectId(id)) {
          id = new mongoose.Types.ObjectId(id); // Convert string ObjectId to ObjectId type
        }
        // If id is a numeric value (e.g., '4'), map it to ObjectId by querying the database
        else if (typeof id !== "number") {
          const idofNumber = parseInt(id);
          const panel = await addPannel.findOne({ order: idofNumber }); // Use panel schema here
          if (!panel) {
            throw new ApiError(400, `Panel with order ${id} not found`);
          }
          id = panel._id; // Use the found ObjectId
        } else {
          throw new ApiError(400, `Invalid ObjectId: ${id}`);
        }

        return {
          updateOne: {
            filter: { _id: id },
            update: { order },
          },
        };
      })
    );

    // Execute the bulk write operation
    await addPannel.bulkWrite(bulkOperations); // Use panel schema here

    res.json({
      status: 200,
      message: "Panel order updated successfully",
    });
  } catch (error) {
    console.error("Error updating panel order:", error);
    throw new ApiError(500, "Failed to update panel order");
  }
});

const tenantAllPanel = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId._id; // Assuming tenant is logged in
  const createdBy = req.user._id;
  try {
    const panels = await addPannel.find({
      tenantId: tenantId,
      createdBy: createdBy,
    });

    res.status(200).json({
      status: 200,
      message: "Tests fetched successfully",
      count: panels.length,
      panels,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tests", error: error.message });
  }
});

export {
  addpannelcontroller,
  allPannelcontroller,
  onePannelcontroller,
  editPannelController,
  updatePannelOrder,
  tenantAllPanel,
};
