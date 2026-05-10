/* MongoDB connection — retry loop, pooling, event logging */
import mongoose from 'mongoose';
import { config } from './env.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);
mongoose.set('bufferCommands', false);

const connectDB = async (attempt = 1) => {
  /* No MONGO_URI = graceful no-DB mode */
  if (!config.mongo.uri) {
    console.warn('⚠️  MONGO_URI not set — running without database (static data only)');
    return false;
  }

  try {
    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: config.mongo.serverSelectionTimeoutMS,
      socketTimeoutMS: config.mongo.socketTimeoutMS,
      maxPoolSize: config.mongo.maxPoolSize,
      minPoolSize: config.mongo.minPoolSize,
      retryWrites: true,
      autoIndex: !config.isProduction,
    });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.error(`❌ MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`);
    if (attempt < MAX_RETRIES) {
      console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s…`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      return connectDB(attempt + 1);
    }
    console.warn('⚠️  Could not connect to MongoDB — running without database (static data only)');
    return false;
  }
};

/* Connection lifecycle events */
mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('♻️  MongoDB reconnected'));
mongoose.connection.on('error', err => console.error('💥 MongoDB error:', err.message));

export default connectDB;
