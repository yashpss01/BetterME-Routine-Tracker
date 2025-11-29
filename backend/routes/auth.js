const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// TODO: Move secret to config file properly later
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_fallback_123';
console.log('Auth Route Loaded. JWT_SECRET present:', !!process.env.JWT_SECRET);

// Register a new user
router.post('/signup', async (req, res) => {
    console.log('Signup attempt:', req.body);
    const { username, password } = req.body;

    // quick validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        // check if taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username taken' });
        }

        const newUser = new User({ username, password });

        // password hashing is handled in the model pre-save now
        // await newUser.hashPassword(); 

        await newUser.save();

        // generate token
        const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username
            }
        });

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: 'Something went wrong during signup' });
    }
});

// Login
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Enter username and password' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // verify pass
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Bad credentials' });

        const token = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (e) {
        // console.log(e);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Get current user info
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).select('-password');
        if (!currentUser) return res.status(404).json({ message: 'User gone?' });
        res.json(currentUser);
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
