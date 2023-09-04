const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const adminSchema = new Schema({
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
    ownedCourses: [
        mongoose.Schema.Types.ObjectId,
    ],
    courses: [
        mongoose.Schema.Types.ObjectId,
    ],
    password: {
        type: String,
        required: true,
        select: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

adminSchema.pre("save",
    adminSchema.methods.getJWTToken = function() {
        return jwt.sign({ id: this._id.toString(), type: "admin", email: this.email, name: this.name, phone: this.phone }, "n2i4i5n32udnwi0f02wjdnakdf", { expiresIn: '7d' })
    }
)

const admin = mongoose.model("ADMIN_DATA", adminSchema);

admin.createIndexes();
module.exports = admin;