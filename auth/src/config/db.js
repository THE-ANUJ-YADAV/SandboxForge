import mongoose from 'mongoose'

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.AUTH_MONGO_URI)
        console.log("Connect to DB")
    }
    catch (err){
        console.error("MongoDB connection error : ",err)
        process.exit(1)
    }
}