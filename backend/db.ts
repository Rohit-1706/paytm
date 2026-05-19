import { password } from "bun";
import mongoose from "mongoose";
import { maxLength, minLength, trim } from "zod";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/paytm";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    firstName :{
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    lastName : {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    }
});

export const User = mongoose.model("User", userSchema);