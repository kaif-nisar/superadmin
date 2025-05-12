// db.config.js
import mongoose from "mongoose";

export const Connect_DB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default Connect_DB;
