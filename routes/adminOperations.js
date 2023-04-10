const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const Tutor = require("../models/tutor");
const Admin = require("../models/admin");
const Course = require("../models/courses");
const nodemailer = require("nodemailer");
const crd = require("../credn");
var newOTP = require("otp-generators");
const fetchuser = require("../middleware/authTokenVarify");

router.use(express.urlencoded({ extended: true }));

router.post("/getAllUsers", fetchuser, async(req, res) => {
    try {
        if (req.data.type != 'admin') {
            return res.status(403).send({
                success: false,
                message: "Not Allowed",
            });
        } else {
            const allUsers = await User.find({});
            return res.status(200).json(allUsers);
        }
    } catch (err) {
        res.status(500).json({ error: "Interanl server error " });
    }
});

router.post("/getAllTutors", fetchuser, async(req, res) => {
    try {
        if (req.data.type != 'admin') {
            return res.status(403).send({
                success: false,
                message: "Not Allowed",
            });
        } else {
            const allTutors = await Tutor.find({});
            return res.status(200).json(allTutors);
        }
    } catch (err) {
        res.status(500).json({ error: "Interanl server error " });
    }
});

router.post("/deleteUser", fetchuser, async(req, res) => {
    try {
        if (req.data.type != 'admin') {
            return res.status(403).send({
                success: false,
                message: "Not Allowed",
            });
        } else {
            const mail = req.body.email;
            const exists = await User.findOne({ email: mail });
            if (!exists) {
                return res.status(404).json({ error: "not found" });
            } else {
                const del = await User.findOneAndDelete({ email: mail });
                if (del) {
                    res.json({ Success: true });
                } else {
                    res.json({ Success: false });
                }
            }
        }
    } catch (err) {
        res.status(500).json({
            error: "Interanl server error ",
            email: req.body.email
        });
    }
});

router.post("/deleteTutor", fetchuser, async(req, res) => {
    try {
        if (req.data.type != 'admin') {
            return res.status(403).send({
                success: false,
                message: "Not Allowed",
            });
        } else {
            const mail = req.body.email;
            const exists = await Tutor.findOne({ email: mail });
            if (!exists) {
                return res.status(404).json({ error: "not found" });
            } else {
                const del = await Tutor.findOneAndDelete({ email: mail });
                if (del) {
                    res.json({ Success: true });
                } else {
                    res.json({ Success: false });
                }
            }
        }
    } catch (err) {
        res.status(500).json({
            error: "Interanl server error ",
            email: req.body.email
        });
    }
});

router.post("/verifyAccount", fetchuser, async(req, res) => {
    try {
        if (req.data.type != 'admin') {
            return res.status(403).send({
                success: false,
                message: "Not Allowed",
            });
        } else {
            await Tutor.findOneAndUpdate({ email: req.body.email }, { verified: true });
            return res.json({ Success: true });
        }
    } catch (err) {
        res.status(500).json({ error: "Interanl server error " });
    }
});

router.post("/verifyCourse", fetchuser, async(req, res) => {
    try {
        if (req.data.type != 'admin') {
            return res.status(403).send({
                success: false,
                message: "Not Allowed",
            });
        } else {
            await Course.findOneAndUpdate({ _id: req.body.id }, { verified: true });
            // await Tutor.findOneAndUpdate({ email: req.body.email }, { verified: true });
            return res.json({ Success: true });
        }
    } catch (err) {
        res.status(500).json({ error: "Interanl server error " });
    }
});

module.exports = router;