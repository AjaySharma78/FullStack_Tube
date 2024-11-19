import mongoose from "mongoose";
import config from "../env/config.js";

const mongoConnection = async()=> {
    try {
       const connectionInfo = await mongoose.connect(`${config.databaseUrl}`);
        console.log(`MongoDB connected to ${connectionInfo.connection.host}`);
    } catch (error) {
        console.log('MongoDB connection error:', error);
        process.exit(1);
    }
}

export default mongoConnection;