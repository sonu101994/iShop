require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Database successfully connected!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("Unable to connect DB!", error.message);
    });