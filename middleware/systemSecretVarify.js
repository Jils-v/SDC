const verifyer = (req, res, next) => {
    const systemSceretKey = req.body.systemSceretKey;
    if (!systemSceretKey) {
        return res.status(401).json({
            success: false,
            message: "Internal Server error",
        });
    }
    try {
        if (systemSceretKey == "20SE02IT05320SE02IT061") {
            next();
        } else {
            res.status(401).json({
                success: false,
                message: "Token not valid",
            });
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
module.exports = verifyer;