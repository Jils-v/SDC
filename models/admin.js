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
    password: {
        type: String,
        required: true,
        select: false,
    },
    date: {
        type: String,
        default: Date.now,
    },
});

adminSchema.pre("save",
    adminSchema.methods.getJWTToken = function() {
        return jwt.sign({ id: this._id.toString(), type: "admin", email: this.email, name: this.name }, "n2i4i5n32udnwi0f02wjdnakdf", { expiresIn: '7d' })
    }
)

const admin = mongoose.model("ADMIN_DATA", adminSchema);

admin.createIndexes();
module.exports = admin;