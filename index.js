require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const productRoutes = require('./routes/product.routes.js');
const userRoutes = require('./routes/user.routes.js');

const app = express();

// --- Linking the frontend (@farm) ---
// To link your backend to the frontend, you need to configure CORS.
// This tells web browsers that it's safe to allow requests from your frontend's URL.

const frontendURL = process.env.FRONTEND_URL;

if (!frontendURL) {
    console.warn("WARNING: FRONTEND_URL is not set in your .env file. CORS may not work as expected for a deployed app.");
}

const corsOptions = {
  // Use the frontend URL from your environment variables.
  // For development, this might be 'http://localhost:3000' or your frontend's dev server address.
  origin: frontendURL || '*', // Fallback to allow all origins for simple local testing
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Database Connection ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("FATAL: MONGO_URI is not defined in the .env file. The application cannot start.");
    process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// --- API Routes ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  if(frontendURL) console.log(`Accepting requests from: ${frontendURL}`);
});