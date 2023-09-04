const express = require("express");
const router = new express.Router();
const Course = require("../models/courses");
const Tutor = require("../models/tutor");
const User = require("../models/user");
const Admin = require("../models/admin");
const fetchuser = require("../middleware/authTokenVarify");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const fileupload = require("express-fileupload");

router.use(express.urlencoded({ extended: true }));
router.use(fileupload());

router.post("/addcourse", fetchuser, async(req, res) => {
    try {
        if (req.data.type == 'user') {
            return res.status(403).send({
                success: false,
                message: "Not Allowed",
            });
        } else {
            const course = await Course.create({
                name: req.body.name,
                duration: req.body.duration,
                courseDate: req.body.date,
                mode: req.body.mode,
                fees: req.body.fees,
                expertName: req.data.name,
                level: req.body.level,
                details: req.body.details,
                participates: [],
                announcements: [],
                material: [],
            });
            const saved = await course.save();

            if (req.data.type == 'tutor') {
                const tutor = await Tutor.findOne({ email: req.data.email });
                tutor.ownedCourses.push(saved._id);
                await Tutor.findOneAndUpdate({ email: req.data.email }, { ownedCourses: tutor.ownedCourses });
            }

            if (req.data.type == 'admin') {
                const admin = await Admin.findOne({ email: req.data.email });
                admin.ownedCourses.push(saved._id);
                await Admin.findOneAndUpdate({ email: req.data.email }, { ownedCourses: admin.ownedCourses });
            }

            return res.status(200).json({
                success: true,
                course: {
                    _id: saved._id,
                    name: course.name,
                    duration: course.duration,
                    courseDate: course.date,
                    mode: course.mode,
                    fees: course.fees,
                    expertName: course.expertName,
                    level: course.level,
                    details: course.details,
                    participates: [],
                    verified: false,
                    announcements: [],
                    material: [],
                }
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
});

router.post("/getCourseDetails", fetchuser, async(req, res) => {
    try {
        const course = await Course.findOne({ _id: req.body.id });
        return res.status(200).json({
            success: true,
            course,
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
});

router.post("/getAllCourses", async(req, res) => {
    try {
        const course = await Course.find({});
        return res.status(200).json({
            success: true,
            courses: course,
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
});

router.post("/enroll", fetchuser, async(req, res) => {
    try {
        var usr;
        if (req.data.type == "user") {
            usr = await User.findOne({ email: req.data.email });
        } else if (req.data.type == "tutor") {
            usr = await Tutor.findOne({ email: req.data.email });
        } else if (req.data.type == "admin") {
            usr = await Admin.findOne({ email: req.data.email });
        }

        if (usr.courses.includes(req.body.id)) {
            return res.status(500).json({
                success: false,
                message: "Already Enrolled",
            });
        } else {
            usr.courses.push(req.body.id);
            var updated;
            if (req.data.type == "user") {
                updated = await User.findOneAndUpdate({ email: req.data.email }, { courses: usr.courses });
            }
            if (req.data.type == "tutor") {
                updated = await Tutor.findOneAndUpdate({ email: req.data.email }, { courses: usr.courses });
            }
            if (req.data.type == "admin") {
                updated = await Admin.findOneAndUpdate({ email: req.data.email }, { courses: usr.courses });
            }
            const course = await Course.findOne({ _id: req.body.id });
            course.participates.push({ name: req.data.name, email: req.data.email, phone: req.data.phone });
            const updated2 = await Course.findOneAndUpdate({ _id: req.body.id }, { participates: course.participates });

            if (updated && updated2) {
                return res.status(200).json({
                    success: true,
                    id: req.body.id
                });
            }
        }
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }

});

router.post("/announcement", fetchuser, async(req, res) => {
    try {
        if (req.data.type == "user") {
            return res.status(400).send({
                success: false,
                message: "Not allowed",
            });
        }

        var usr;
        if (req.data.type == "tutor") {
            usr = await Tutor.findOne({ email: req.data.email });
        }
        if (req.data.type == "admin") {
            usr = await Admin.findOne({ email: req.data.email });
        }

        if (usr.ownedCourses.includes(req.body.id)) {
            const course = await Course.findOne({ _id: req.body.id });
            course.announcements.push(req.body.message);
            const update = await Course.findOneAndUpdate({ _id: req.body.id }, { announcements: course.announcements });
            if (update) {
                return res.status(200).json({
                    success: true,
                    id: req.body.id
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Bad Request",
            });
        }
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
});

router.post("/addMaterial", fetchuser, async(req, res) => {
    try {
        if (req.data.type == "user") {
            return res.status(400).send({
                success: false,
                message: "Not allowed",
            });
        }

        var usr;
        if (req.data.type == "tutor") {
            usr = await Tutor.findOne({ email: req.data.email });
        }
        if (req.data.type == "admin") {
            usr = await Admin.findOne({ email: req.data.email });
        }

        if (usr.ownedCourses.includes(req.body.id)) {
            const course = await Course.findOne({ _id: req.body.id });

            const buffer = req.files.file.data;
            let baseDir = path.join(__dirname, '/../materialFiles/');

            const fileName = uuidv4();;

            fs.writeFileSync(`${baseDir}${fileName}.pdf`, buffer, (err) => {
                if (err) {
                    throw err;
                }
            });

            const location = `http://localhost:5000/files/${fileName}.pdf`;
            course.material.push(location);

            const update = await Course.findOneAndUpdate({ _id: req.body.id }, { material: course.material });

            if (update) {
                return res.status(200).json({
                    success: true,
                    id: req.body.id
                });
            }

        } else {
            return res.status(400).json({
                success: false,
                message: "Bad Request",
            });
        }
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: "Internal server error"
        })
    }
});


module.exports = router;