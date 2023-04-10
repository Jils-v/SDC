const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
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
    // courses: [{
    //     id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //     }
    // }],
    courses: [
        mongoose.Schema.Types.ObjectId,
    ],
    date: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save",
    userSchema.methods.getJWTToken = function() {
        return jwt.sign({ id: this._id.toString(), type: "user", email: this.email, name: this.name, phone: this.phone }, "n2i4i5n32udnwi0f02wjdnakdf", { expiresIn: '7d' })
    }
)

const user = mongoose.model("USER_DATA", userSchema);

user.createIndexes();
module.exports = user;