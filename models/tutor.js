const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const tutorSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    ownedCourses: [
        mongoose.Schema.Types.ObjectId,
    ],
    courses: [
        mongoose.Schema.Types.ObjectId,
    ],
    date: {
        type: Date,
        default: Date.now,
    },
});

tutorSchema.pre("save",
    tutorSchema.methods.getJWTToken = function() {
        return jwt.sign({ id: this._id.toString(), type: "tutor", email: this.email, name: this.name, phone: this.phone }, "n2i4i5n32udnwi0f02wjdnakdf", { expiresIn: '7d' })
    }
)

const tutor = mongoose.model("TUTOR_DATA", tutorSchema);

tutor.createIndexes();
module.exports = tutor;