var jwt = require("jsonwebtoken");
const JWT_SECRET = "n2i4i5n32udnwi0f02wjdnakdf";

const fetchuser = (req, res, next) => {
    const token = req.body.authToken;
    if (!token) {
        return
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.data = data;
        next();
    } catch (error) {
        res.status(401).send({ error: "Internal server error" });
    }
};
module.exports = fetchuser;