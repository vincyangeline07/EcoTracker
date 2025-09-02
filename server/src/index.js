import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'ecotrack', 
    time: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRouter);

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
};

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://vincy123:Vincy007@ecotracker.ibqxknk.mongodb.net/?retryWrites=true&w=majority&appName=EcoTracker';
const PORT = process.env.PORT || 4000;

// Database connection function
async function connectDB() {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    await mongoose.connect(MONGO_URI, mongoOptions);
    
    console.log('✅ Successfully connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Specific error handling
    if (error.name === 'MongoServerSelectionError') {
      console.error('🔍 Server selection failed. Check your connection string and network.');
    } else if (error.name === 'MongoParseError') {
      console.error('🔍 Invalid connection string format.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('🌐 Network error. Check your internet connection.');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('🔐 Authentication failed. Check your username and password.');
    }
    
    return false;
  }
}

// Database connection event handlers
function setupDBEvents() {
  mongoose.connection.on('connected', () => {
    console.log('🟢 MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('🔴 MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🟡 MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🟢 MongoDB reconnected');
  });

  mongoose.connection.on('close', () => {
    console.log('🔴 MongoDB connection closed');
  });
}

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
  });
}

// Main server startup function
async function start() {
  try {
    // Setup database event handlers
    setupDBEvents();
    
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 Started at: ${new Date().toISOString()}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
start();


