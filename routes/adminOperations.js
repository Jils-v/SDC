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
        res.status(500).json({ message: "Interanl server error " });
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
        res.status(500).json({ message: "Interanl server error " });
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
                return res.status(404).json({ message: "not found" });
            } else {
                const del = await User.findOneAndDelete({ email: mail });
                if (del) {
                    res.json({ Success: true, email: req.body.email });
                } else {
                    res.json({ Success: false, message: "Failed" });
                }
            }
        }
    } catch (err) {
        res.status(500).json({
            message: "Interanl server error ",
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
                return res.status(404).json({ message: "not found" });
            } else {
                const del = await Tutor.findOneAndDelete({ email: mail });
                if (del) {
                    res.json({ Success: true, email: req.body.email });
                } else {
                    res.json({ Success: false, message: "Failed" });
                }
            }
        }
    } catch (err) {
        res.status(500).json({
            message: "Interanl server error ",
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

            const mail = nodemailer.createTransport({
                host: "smtp.gmail.com",
                service: "gmail",
                port: 587,
                secure: true,
                auth: {
                    user: crd.user,
                    pass: crd.pass,
                },
            });

            mail.sendMail({
                    from: "doremonnobi3922@gmail.com",
                    to: await req.body.email,
                    subject: "Account Verification",
                    text: "",
                    html: "<p> Your tutor account is verified now, you can add your courses. </p>",
                },
                (err) => {
                    if (err)
                        res.status(500).json({
                            success: false,
                            message: "Internal server Error",
                        });
                }
            );

            return res.json({
                Success: true,
                email: req.body.email
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Interanl server error ",
        });
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
            return res.json({
                Success: true,
                id: req.body.id
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Interanl server error ",
        });
    }
});

router.post("/deleteCourse", fetchuser, async(req, res) => {
    try {
        if (req.data.type != 'admin') {
            return res.status(403).send({
                success: false,
                message: "Not Allowed",
            });
        } else {
            const id = req.body.id;
            const exists = await Course.findOne({ _id: id });
            if (!exists) {
                return res.status(404).json({ message: "not found" });
            } else {
                const del = await Course.findOneAndDelete({ _id: id });
                if (del) {
                    res.json({ Success: true, id: req.body.id });
                } else {
                    res.json({ Success: false, message: "Failed" });
                }
            }
        }
    } catch (err) {
        res.status(500).json({
            message: "Interanl server error ",
        });
    }
});

module.exports = router;