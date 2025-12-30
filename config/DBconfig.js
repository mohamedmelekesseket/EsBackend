
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import colors from 'colors';

const URL = process.env.MONGO_URI;

const connectToMongooset = async () => {
  try {
    if (!URL) {
      console.error('❌ Missing MONGO_URI in .env');
      return;
    }
    await mongoose.connect(URL);
    console.log('✅ Database connected successfully'.green.underline);
  } catch (error) {
    console.log('❌ Database connection failed:'.red, error.message);
  }
};

export default connectToMongooset;
