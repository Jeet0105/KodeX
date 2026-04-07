import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ role: 'user' }).select('username totalPoints role');
    console.log("USERS WITH role:user");
    console.log(users);
    
    const allUsers = await User.find().select('username totalPoints role').sort({ totalPoints: -1 });
    console.log("\nALL USERS SORTED BY TOTAL POINTS DESC");
    console.log(allUsers);
    
    process.exit(0);
}

test();
