const connectTomongo = require("./db");
const express = require("express");
const cors = require("cors");
connectTomongo();

const app = express();

app.use(cors({ origin: '*' }));

app.use(express.json());
const port = process.env.PORT | 5000;

app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pass to next layer of middleware
    next();
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/adminoperation", require("./routes/adminOperations"));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});