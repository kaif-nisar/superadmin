import { Counter,categorydb } from "../models/category.model.js";
import mongoose from "mongoose"

// Function to get the next sequence value for the orderId
const getNextSequenceValue = async (counterId) => {
    try {
        const counter = await Counter.findByIdAndUpdate(
            counterId,
            { $inc: { sequence_value: 1 } }, // Increment sequence_value by 1
            { new: true, upsert: true } // Create a new document if it doesn't exist
        );
        return counter.sequence_value;
    } catch (error) {
        throw new Error("Failed to get next sequence value: " + error.message);
    }
};

// Function to add a new category
const addCategory = async (req, res) => {

    const { category } = req.body;

    try {
        // Get the next orderId
        const orderId = await getNextSequenceValue("categoryOrder");

        // Create a new category document
        const newCategory = new categorydb({
            orderId: orderId,
            category: category,
        });

        // Save the category to the database
        const savedCategory = await newCategory.save();
        return res.json({ message: `${category} added successfully:` });

    } catch (error) {
        console.error("Error adding category:", error.message);
    }
};

// Function to fetch all categories
const fetchCategories = async (req, res) => {
    try {
        // Retrieve all categories from the database, sorted by orderId
        const categories = await categorydb.find().sort({ orderId: 1 });

        if (!categories) {
            return res.json({ message: "categories not found" });
        }

        // Send the categories as a JSON response
        return res.json({
            message: "Categories fetched successfully",
            categories: categories
        });

    } catch (error) {
        console.error("Error fetching categories:", error.message);
        return res.status(500).json({ error: "An error occurred while fetching categories." });
    }
};

const updatecategoryOrder = async (req, res) => {
    const { updatedOrder } = req.body;

    if (!Array.isArray(updatedOrder) || updatedOrder.length === 0) {
        return res.status(400).json({ message: "Invalid or empty order data" });
    }

    try {
        // Step 1: Fetch all categories and map orderId to _id
        const categories = await categorydb.find({});
        const categoryMap = new Map();
        categories.forEach((category) => {
            categoryMap.set(category.orderId, category._id.toString());
        });

        // Step 2: Use a temporary orderId to avoid duplicates
        for (let i = 0; i < updatedOrder.length; i++) {
            const { id: oldOrderId, orderId: newOrderId } = updatedOrder[i];

            // Resolve _id using oldOrderId
            const resolvedId = categoryMap.get(Number(oldOrderId));
            if (!resolvedId) {
                throw new Error(`Category with orderId ${oldOrderId} not found`);
            }

            // Temporarily set a unique orderId
            await categorydb.updateOne(
                { _id: new mongoose.Types.ObjectId(resolvedId) },
                { $set: { orderId: -1 * (i + 1) } } // Negative temporary orderId
            );
        }

        // Step 3: Apply the final new orderId
        for (let i = 0; i < updatedOrder.length; i++) {
            const { id: oldOrderId, orderId: newOrderId } = updatedOrder[i];

            // Resolve _id using oldOrderId
            const resolvedId = categoryMap.get(Number(oldOrderId));
            if (!resolvedId) {
                throw new Error(`Category with orderId ${oldOrderId} not found`);
            }

            // Set the final orderId
            await categorydb.updateOne(
                { _id: new mongoose.Types.ObjectId(resolvedId) },
                { $set: { orderId: newOrderId } }
            );
        }

        res.status(200).json({
            status: 200,
            message: "Category order updated successfully",
        });
    } catch (error) {
        console.error("Error updating category order:", error.message);

        res.status(500).json({
            message: error.message || "Failed to update category order",
        });
    }
};

const categoryById = async (req, res) => {
    try {
        const { category } = req.body;
        console.log(category)
        const categoryDocument = await categorydb.findOne({category: category});
        if (!categoryDocument) {
            return res.json({ message: "Category not found" });
        }
        res.status(200).json(categoryDocument);
    } catch (error) {
        console.log(error)
    }
}

export {

    addCategory,
    fetchCategories,
    updatecategoryOrder,
    categoryById
}