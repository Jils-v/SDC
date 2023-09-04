const express = require("express");
const router = new express.Router();

router.get("/:id", async(req, res) => {
    const filename = req.params.id;
    const path2 = `D:/SDC/Backend/materialFiles/${filename}`;
    res.sendFile(path2);
});

module.exports = router;