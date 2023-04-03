const express = require("express");
const router = new express.Router();
const Course = require("../models/courses");
const Tutor = require("../models/tutor");
const fetchuser = require("../middleware/authTokenVarify");

router.use(express.urlencoded({ extended: true }));

router.post("/addcourse", fetchuser, async(req, res) => {
    try {
        if (req.data.type != 'tutor') {
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
            });
            const saved = await course.save();

            const tutor = await Tutor.findOne({ email: req.data.email });
            tutor.courses.push(saved._id);
            await Tutor.findOneAndUpdate({ email: req.data.email }, { courses: tutor.courses });

            return res.status(200).json({
                success: true,
                course: {
                    name: course.name,
                    duration: course.duration,
                    courseDate: course.date,
                    mode: course.mode,
                    fees: course.fees,
                    expertName: course.expertName,
                    level: course.level,
                    details: course.details,
                    participates: [],
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

router.post("/getAllCourses", fetchuser, async(req, res) => {
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

module.exports = router;