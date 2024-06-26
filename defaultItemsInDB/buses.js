const mongoose = require("mongoose");

const Bus = require("../models/busModel");


//buses
const bus0 = new Bus({
    route: "KLS Gogte Institute of Technology",
    busNo: 0,
    password: "KLS Gogte Institute of Technology Udyambag",
    numberPlate: "none",
    longitude: 74.4871326464867,
    latitude: 15.815238972535886,
    seatsFilled: 0,
    totalSeats: 0
});
const bus1 = new Bus({
    route: "Mahantesh nagar",
    busNo: 1,
    password: "Mahantesh nagar",
    numberPlate: "KA 22 MC 2166",
    longitude: 74.53642393726847,
    latitude: 15.881915347206428,
    seatsFilled: 0,
    totalSeats: 0
});
const bus2 = new Bus({
    route: "Hanuman nagar",
    busNo: 10,
    password: "Hanuman nagar",
    numberPlate: "KA 22 MC 2166",
    longitude: 74.48591797126895,
    latitude: 15.876246560391277,
    seatsFilled: 0,
    totalSeats: 0
});
const bus3 = new Bus({
    route: "Sambra",
    busNo: 3,
    password: "Sambra",
    numberPlate: "KA 22 MC 2166",
    longitude: 74.61385221509138,
    latitude: 15.869056261665328,
    seatsFilled: 0,
    totalSeats: 0
});
const bus4 = new Bus({
    route: "Bhagya nagar",
    busNo: 4,
    password: "Bhagya nagar",
    numberPlate: "KA 22 MC 2166",
    longitude: 74.5030350650296,
    latitude: 15.830011184622268,
    seatsFilled: 0,
    totalSeats: 0
});

module.exports = [bus0, bus1, bus2, bus3, bus4];