const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    usn: String,
    password: String
});

module.exports = mongoose.model("student", studentSchema);