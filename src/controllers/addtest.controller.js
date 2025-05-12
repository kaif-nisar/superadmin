import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { categorydb, Counter } from "../models/category.model.js"
import { testSchema } from "../models/newTest.model.js"
import { testCounter } from "../models/counterTests.model.js"
import mongoose from "mongoose"
import { sampleSchema } from "../models/sampletype.model.js";
import { unitdb } from "../models/category.model.js";

const getNextSequenceValue = async (counterName) => {
    const counter = await testCounter.findOneAndUpdate(
        { _id: counterName },
        { $inc: { sequenceValue: 1 } }, // Increment sequenceValue by 1
        { new: true, upsert: true } // Create if not exists and return the updated document
    );

    if (!counter) {
        throw new Error(`Failed to retrieve or create counter with name: ${counterName}`);
    }

    return counter.sequenceValue;
};


const addingTest = asyncHandler(async (req, res) => {

    // trim all values in req.body
    Object.entries(req.body).forEach(([key, value]) => {
        if (typeof value === "string") {
            req.body[key] = value.trim()
        }
    })

    const { Name, final_price, Short_name, category, Price, sampleType, method, instrument, parameters, interpretation, isDocumentedTest, user } = req.body;
    // const superAdmin = req.user.id // get the super admin id from token 
    // checking if test is allready in database
    const allreadyExistedTest = await testSchema.findOne(
        { Name: Name }
    )

    if (allreadyExistedTest) {
        return res.status(400).json({ message: "Test was already present in database" })
    }

    // Get the next order number
    const nextOrder = await getNextSequenceValue("orderCounter");

    const testCreated = await testSchema.create({
        Name,
        Short_name,
        category: category || "",
        Price,
        parameters: parameters || null,
        sampleType,
        method: method || "",
        instrument: instrument || "",
        interpretation: interpretation || "",
        order: nextOrder,
        isDocumentedTest: isDocumentedTest,
        final_price,
        createdBy: user._id, // add the super admin id to the test
        originalTestId: null,
        isBaseTest: true,
        purchasedFromBaseTest: false,
    })
    if (!testCreated) {
        return res.status(200).json({ message: "Failed to create test" })
    }
    return res.json({
        status: 200,
        test: testCreated,
        message: "test is created sucessfully"
    })

})

const addsample = async (req,res) => {
    const {Name, user} = req.body;

    if(!Name) {
        return res.status(400).json({message: "! please enter Name"})
    }

    const duplicate = await sampleSchema.findOne({
        Name: Name
    })

    if (duplicate) {
        return res.status(400).json({message: "! This sampletype is already present"})
    }

    const createddoc = await sampleSchema.create({
        Name: Name,
        createdBy: user || ""
    })

    if (!createddoc) {
        return res.status(401).json({message: "! Something went wrong, please try again"})
    }

    return res.status(200).json({message: "sample added successfully"});

}
const fetchsample = async (req,res) => {

    const samples = await sampleSchema.find({})

    if (!samples) {
        return res.status(500).json({message: "! No samples found"})
    }

    return res.status(200).json({message: "sample added successfully", data: samples});
}

const updateTestInterpretation = asyncHandler(async (req, res) => {
    const { testId, interpretation } = req.body;

    if (!testId || !interpretation) {
        throw new ApiError(400, "Test ID and interpretation are required.");
    }

    // Find the test by testId and update the interpretation
    const updatedTest = await testSchema.findByIdAndUpdate(
        testId,
        { interpretation }, // Only update the interpretation field
        { new: true } // Return the updated document
    );

    if (!updatedTest) {
        throw new ApiError(404, "Test not found.");
    }

    return res.json({
        status: 200,
        test: updatedTest,
        message: "Test interpretation updated successfully"
    });
});

const updateTestOrder = asyncHandler(async (req, res) => {
    const { updatedOrder } = req.body;
    console.log(updatedOrder);

    if (!Array.isArray(updatedOrder) || updatedOrder.length === 0) {
        throw new ApiError(400, "Invalid or empty order data");
    }

    try {
        const bulkOperations = await Promise.all(updatedOrder.map(async (orderData) => {
            let { id, order } = orderData;

            // If id is a valid MongoDB ObjectId, use it directly
            if (mongoose.isValidObjectId(id)) {
                id = new mongoose.Types.ObjectId(id); // Convert string ObjectId to ObjectId type
            }
            // If id is a numeric value (e.g., '4'), map it to ObjectId by querying the database
            else if (typeof id !== "number") {
                const idofNumber = parseInt(id);
                const test = await testSchema.findOne({ order: idofNumber });
                if (!test) {
                    throw new ApiError(400, `Test with order ${id} not found`);
                }
                id = test._id; // Use the found ObjectId
            }
            else {
                throw new ApiError(400, `Invalid ObjectId: ${id}`);
            }

            return {
                updateOne: {
                    filter: { _id: id },
                    update: { order },
                },
            };
        }));

        // Execute the bulk write operation
        await testSchema.bulkWrite(bulkOperations);

        res.json({
            status: 200,
            message: "Test order updated successfully",
        });
    } catch (error) {
        console.error("Error updating test order:", error);
        throw new ApiError(500, "Failed to update test order");
    }
});


const editTest = asyncHandler(async (req, res) => {
    const { _id, Name, final_price, Short_name, category, Price, sampleType, method, instrument, interpretation, parameters } = req.body;
    // console.log( _id)

    const currentTest = await testSchema.findById({
        _id
    });
    const duplicatetest = await testSchema.findOne({
       $or: [
        {Name: Name},
       ]
    });
    
    if (duplicatetest && !(duplicatetest._id.toString() === _id)) {
       return res.status(400).json({message:"this Test Name is already taken"});
    }
    if (!currentTest) {
       return res.status(401).json({message:"something went wrong, Test not found"});
    }

    const editedTest = await testSchema.findOneAndUpdate(
        {
            _id
        },
        {
            Name,
            Short_name,
            category: category || "",
            Price,
            parameters: parameters || null,
            sampleType,
            method: method || "",
            instrument: instrument || "",
            interpretation: interpretation || "",
            final_price
        },
        { new: true }
    );

    if (!editedTest) {
        return res.status(402).json({message:"Something went wrong, please try again"});
    }

    return res.status(200).json({message:"test edited successfully"});
});



const allTest = asyncHandler(async (req, res) => {
    const { name } = req.params;
    console.log(name)
    const allrecievedTest = await testSchema.find()

    if (!allrecievedTest) {
        throw new ApiError(400, "Something went wrong while fetching details")
    }

    return res.json(allrecievedTest)

})

// for test category creation
const testCate = asyncHandler(async (req, res) => {

    const { catName } = req.body

    const fetchedcategory = await categorydb.findOne({
        category: catName
    });

    if (fetchedcategory) {
        return res.json({ message: `'${catName}' allready present`, type:"error" });
    }

    if (!catName && typeof catName !== "string") {
        return res.json({ message: "please enter category Name", type:"auth" });
    }

    const incremented = await Counter.findOneAndUpdate(
        { _id: "orderId" },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    )

    console.log(incremented)

    if (!incremented) {
        return res.json({ message: "Invalid orderId, please try again", type:"error" });
    }

    const newCategory = await categorydb.create({
        orderId: incremented.sequence_value,
        category: catName
    })

    if (!newCategory) {
        return res.json({ message: "Connection error, please check your internet connection", type:"error" });
    }

    return res.json({ message: "category added successfully", type:"success" });

})

// for fetc all test category
const getAllTestCate = asyncHandler(async (req, res) => {
    const allrecievedTest = await categorydb.find()
    if (!allrecievedTest) {
        throw new ApiError(400, "Something went wrong while fetching details")
    }
    return res.json(new ApiResponse(201, allrecievedTest, { success: true }))
})
//fetch one category base on id
const getOneTestCate = asyncHandler(async (req, res) => {
    const _id = req.query._id;
    const oneTest = await categorydb.findById(_id)
    if (!oneTest) {
        throw new ApiError(400, "Something went wrong while fetching details")
    }
    return res.json(new ApiResponse(201, oneTest, { success: true }))
});

// fetch one test base on id
const getOneTest = asyncHandler(async (req, res) => {
    const { Name } = req.query
    const oneTest = await testSchema.findById({ _id: Name })
    if (!oneTest) {
        throw new ApiError(400, "Something went wrong while fetching details")
    }
    return res.json(new ApiResponse(201, oneTest, { success: true }))
})


// update one category base on id
const updateTestCate = asyncHandler(async (req, res) => {
    const { _id } = req.query
    const { catName } = req.body
    let category = catName
    const duplicateTest = await categorydb.findOne({ category: category });
    if (duplicateTest) {
        return res.json({
            message: `${category} already present`,
            type: "auth"
        });
    }
    const updatedTest = await categorydb.findByIdAndUpdate(_id, { category }, { new: true })

    if (!updatedTest) {
        return res.json({
            message: `please check your internet connection`,
            type: "error"
        });
    }
    return res.json({message: `edited successfully`, type: "success"});
})

//for test category edit
const editTestCate = asyncHandler(async (req, res) => {

    const { category } = req.params

    if (!category) {
        throw new ApiError(400, "an error occured when sending variables through url")
    }

    const { catName } = req.body

    if (!catName) {
        throw new ApiError(400, "please enter Name")
    }

    const editedCategory = await categorydb.findOneAndUpdate(
        { category: category },
        {
            $set:
                { category: catName }
        },
        { new: true }
    )

    if (!editedCategory) {
        throw new ApiError(400, "something went wrong")
    }

    return res.json(new ApiResponse(200, { editedCategory }, "category edited successfully"))

})

const editdefaultresult = asyncHandler(async (req, res) => {
    const { dataObject, tname, text } = req.body;

    if (!dataObject) {
        throw new ApiError(500, "Please recreate range");
    }

    let editeddefaultresultText;

    // Update the text field if provided
    if (text) {
        editeddefaultresultText = await testSchema.findOneAndUpdate(
            { "parameters.Para_name": tname }, // Query to find the matching element
            { $set: { "parameters.$.text": text } }, // Update only the `text` field
            { new: true } // Return the updated document
        );
    }

    // Update the NormalValue field for the specific parameter
    const editeddefaultresult = await testSchema.findOneAndUpdate(
        { "parameters.Para_name": tname }, // Query to find the matching element
        { $set: { "parameters.$.NormalValue": dataObject } }, // Update only the `NormalValue` field
        { new: true } // Return the updated document
    );

    return res.status(200).json({
        editeddefaultresult,
        editeddefaultresultText,
    });
});


const findTestcontroller = asyncHandler(async (req, res) => {
    const { name, shortName } = req.params;

    // if(!(name || shortName)) {
    //     throw new ApiError(400, "please give name or shortname")
    // }

    const tests = await testSchema.findOne({
        Name: name
        // $or: [
        //     {Name: name},
        //     {Short_name: shortName}
        // ]
    })

    if (!tests) {
        throw new ApiError(400, "test not found")
    }

    return res.json(tests)

})

const updateTestcontroller = asyncHandler(async (req, res) => {

    const { name, shortName } = req.params;
    const { Name, Short_name, category, Price, sampleType, method, instrument, interpretation, parameters, NormalValue } = req.body;

    const updatedtests = await testSchema.findOneAndUpdate(
        {
            $or: [
                { Name: name },
                { Short_name: shortName }
            ]
        },
        {
            $set: {
                Name: Name,
                Short_name: Short_name,
                category: category || "",
                Price,
                parameters: parameters || "",
                sampleType,
                method: method || "",
                instrument: instrument || "",
                interpretation,
                defaultresult: NormalValue || ""
            }
        },
        { new: true } // `upsert: true` will create a new document if not found
    );


    if (!updatedtests) {
        throw new ApiError(400, "test not updated")
    }

    return res.json(updatedtests)

})
const addUnit = asyncHandler(async (req, res) => {
  const { unit } = req.body;
  const unitExists = await unitdb.findOne({ unit });
  if (unitExists) {
    throw new ApiError("Unit already exists");
  }
  const newUnit = new unitdb({ unit });
  await newUnit.save();

  return res.status(201).json({ unit: newUnit.unit });
});

const getUnits = asyncHandler(async (req, res) => {
  const units = await unitdb.find().sort({ unit: 1 });

  return res.status(200).json({ units });
});
const tenantTest = asyncHandler(async (req, res) => {
  const tenantId = req.user._id; // Assuming tenant is logged in
  const createdBy = req.user._id;

  try {
    const tests = await testSchema.find({
      tenantId: tenantId,
      createdBy: createdBy,
    });

    res.status(200).json({
      status: 200,
      message: "Tests fetched successfully",
      count: tests.length,
      tests,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tests", error: error.message });
  }
});
export {
    addingTest,
    editTest,
    allTest,
    testCate,
    editTestCate,
    editdefaultresult,
    getAllTestCate,
    getOneTestCate,
    updateTestCate,
    findTestcontroller,
    updateTestcontroller,
    updateTestOrder,
    updateTestInterpretation,
    getOneTest,
    addsample,
    fetchsample,
    getUnits,
    addUnit,
    tenantTest
}