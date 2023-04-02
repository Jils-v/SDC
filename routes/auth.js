const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const Tutor = require("../models/tutor");
const Admin = require("../models/admin");
const nodemailer = require("nodemailer");
const crd = require("../credn");
var newOTP = require("otp-generators");
var bcrypt = require("bcryptjs");
const verifyer = require("../middleware/systemSecretVarify");
const fetchuser = require("../middleware/authTokenVarify");

router.use(express.urlencoded({ extended: true }));

router.post("/emailVerify", verifyer, async(req, res) => {
    try {
        let user = await User.exists({ email: req.body.email });
        let user2 = await Tutor.exists({ email: req.body.email });
        let user3 = await Admin.exists({ email: req.body.email });
        if (user || user2 || user3) {
            return res.status(400).json({
                success: false,
                message: "sorry account with this email already exist",
            });
        } else {
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

            let otp = newOTP.generate(6, {
                alphabets: false,
                upperCase: false,
                specialChar: false,
            });

            mail.sendMail({
                    from: "doremonnobi3922@gmail.com",
                    to: await req.body.email,
                    subject: "Otp for account creation",
                    text: "",
                    html: "<h3 >" +
                        "your OTP is :" +
                        otp +
                        "</h3> <br/> <p>if you haven't requested Otp then please avoid.",
                },
                (err) => {
                    if (err)
                        res.status(500).json({
                            success: false,
                            message: "Internal server Error",
                        });
                }
            );
            res.status(200).json({
                success: true,
                otp: otp,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
        });
    }
});

router.post("/signup", verifyer, async(req, res) => {
    try {
        const usr = await User.findOne({ email: req.body.email }).select("+password");
        const tutor = await Tutor.findOne({ email: req.body.email }).select("+password");
        if (usr || tutor) {
            return res.status(400).json({
                success: false,
                message: "email already exists",
            });
        }

        const salt = await bcrypt.genSalt(10); //gensalt generate the salt
        const secPass = await bcrypt.hashSync(req.body.password, salt);

        if (req.body.type == 'user') {
            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: secPass,
            });

            try {
                const token = await user.getJWTToken();
                user.save().then(
                    res.status(200).json({
                        success: true,
                        token,
                        user: {
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            type: "user",
                        },
                    })
                );
            } catch (e) {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        } else if (req.body.type == 'tutor') {
            const tutor = await Tutor.create({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                verified: false,
                password: secPass,
            });

            try {
                const token = await tutor.getJWTToken();
                tutor.save().then(
                    res.status(200).json({
                        success: true,
                        token,
                        user: {
                            name: tutor.name,
                            email: tutor.email,
                            phone: tutor.phone,
                            verified: tutor.verified,
                            type: "tutor",
                        },
                    })
                );
            } catch (e) {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        } else {
            return res.status(500).json({
                success: false,
                message: "Request not valid",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.post("/login", verifyer, async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    var role;
    var usr;
    usr = await User.findOne({ email }).select("+password");
    if (usr) {
        role = "user";
    } else {
        usr = await Tutor.findOne({ email }).select("+password");
        if (usr) {
            role = "tutor";
        } else {
            usr = await Admin.findOne({ email }).select("+password");
            if (usr) {
                role = "admin";
            } else {
                return res.status(400).json({
                    success: false,
                    message: "please try to login with correct credentials",
                });
            }
        }
    }

    const passowrdCompare = await bcrypt.compare(password, usr.password);
    if (!passowrdCompare) {
        return res.status(400).json({
            success: false,
            message: "invalid Email or Password",
        });
    } else {
        try {
            const token = await usr.getJWTToken();
            return res.status(200).json({
                success: true,
                token,
                user: {
                    name: usr.name,
                    email: usr.email,
                    phone: usr.phone,
                    type: role,
                },
            });
        } catch {
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
});

router.post("/emailForReset", verifyer, async(req, res) => {
    try {
        let user = await User.exists({ email: req.body.email });
        let user2 = await Tutor.exists({ email: req.body.email });
        let user3 = await Admin.exists({ email: req.body.email });
        if (user || user2 || user3) {
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

            let otp = newOTP.generate(6, {
                alphabets: false,
                upperCase: false,
                specialChar: false,
            });

            mail.sendMail({
                    from: "doremonnobi3922@gmail.com",
                    to: await req.body.email,
                    subject: "Otp for password reset",
                    text: "",
                    html: "<h3 >" +
                        "your OTP is :" +
                        otp +
                        "</h3> <br/> <p>if you haven't requested Otp then please avoid.",
                },
                (err) => {
                    if (err)
                        res.status(500).json({
                            success: false,
                            message: "Internal server Error",
                        });
                }
            );
            res.status(200).json({
                success: true,
                otp: otp,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "sorry account with this email not exist",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
        });
    }
});

router.post("/resetPassword", verifyer, async(req, res) => {
    try {
        const user = await User.exists({ email: req.body.email });
        if (user) {
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hashSync(req.body.password, salt);
            await User.findOneAndUpdate({ email: req.body.email }, { password: secPass });
            return res.status(200).json({
                success: true,
                message: "Password reseted",
            });
        } else {
            const user = await Tutor.exists({ email: req.body.email });
            if (user) {
                const salt = await bcrypt.genSalt(10);
                const secPass = await bcrypt.hashSync(req.body.password, salt);
                await Tutor.findOneAndUpdate({ email: req.body.email }, { password: secPass });

                return res.status(200).json({
                    success: true,
                    message: "Password reseted",
                });
            } else {
                const user = await Admin.exists({ email: req.body.email });
                if (user) {
                    const salt = await bcrypt.genSalt(10);
                    const secPass = await bcrypt.hashSync(req.body.password, salt);
                    await Admin.findOneAndUpdate({ email: req.body.email }, { password: secPass });

                    return res.status(200).json({
                        success: true,
                        message: "Password reseted",
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: "account not exists",
                    });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

router.post("/authCheck", fetchuser, (req, res) => {
    try {
        const person = User.findOne({ email: req.data.email });
        if (person && req.data.type == "user") {
            return res.status(200).send({
                success: true,
                type: req.data.type,
            });
        } else {
            const person = Tutor.findOne({ email: req.data.email });
            if (person && req.data.type == "tutor") {
                return res.status(200).send({
                    success: true,
                    type: req.data.type,
                });
            } else {
                const person = Admin.findOne({ email: req.data.email });
                if (person && req.data.type == "admin") {
                    return res.status(200).send({
                        success: true,
                        type: req.data.type,
                    });
                } else {
                    res.status(401).send({
                        success: false,
                        error: "Account not found or user type changed",
                    });
                }
            }
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            error: "Internal server error",
        });
    }
});

module.exports = router;