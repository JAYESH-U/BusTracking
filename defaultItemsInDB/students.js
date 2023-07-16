const mongoose = require("mongoose");
const Std = require("../models/studentModel");

//students
const std1 = new Std({
    usn: "2GI21IS025",
    password: "2GI21IS025"
});

const std2 = new Std({
    usn: "2GI21IS012",
    password: "2GI21IS012"
});

const std3 = new Std({
    usn: "2GI21IS057",
    password: "2GI21IS057"
});

module.exports = [std1, std2, std3];