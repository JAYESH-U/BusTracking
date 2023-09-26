const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    route: String,
    busNo: Number,
    password: String,
    numberPlate: String,
    longitude: Number,
    latitude: Number,
    seatsFilled: Number,
    totalSeats: Number
}, { timestamps: true }
);

module.exports = mongoose.model("bus", busSchema);