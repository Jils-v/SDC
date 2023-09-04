const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const courseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    courseDate: {
        type: Date,
        required: true,
    },
    mode: {
        type: String,
        required: true,
    },
    fees: {
        type: Number,
        required: true,
    },
    expertName: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    participates: [{
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        }
    }],
    announcements: [
        String,
    ],
    material: [
        String,
    ],
    date: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("Courses", courseSchema);