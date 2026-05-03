const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, category } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });
        const user = await User.create({ firstName, lastName, email, password, role: role || 'customer', category: role === 'worker' ? category : undefined });
        res.status(201).json({ success: true, data: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, token: generateToken(user._id) }});
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({ success: true, data: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, token: generateToken(user._id) }});
        } else { res.status(401).json({ success: false, message: 'Invalid email or password' }); }
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/me', require('../middleware/authMiddleware').protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, data: user });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

const nodemailer = require('nodemailer');

router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'FixConnect - Password Reset OTP',
            text: `Your OTP for resetting your password is ${otp}. It expires in 10 minutes.`
        });

        res.json({ success: true, message: 'OTP sent' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email, resetPasswordOTP: otp, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        res.json({ success: true, message: 'OTP verified' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email, resetPasswordOTP: otp, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid request' });

        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
