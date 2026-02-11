const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Database Connection (Optimized for Vercel)
let cachedDb = null;
const connectDB = async () => {
    if (cachedDb) return cachedDb;
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        cachedDb = db;
        console.log('MongoDB connected');
        return db;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// Routes (Placeholders)
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import Routes
const authRouter = require('./routes/auth');
const notesRouter = require('./routes/notes');
const bookmarksRouter = require('./routes/bookmarks');

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/bookmarks', bookmarksRouter);

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
