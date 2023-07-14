require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");

const Bus = require("./models/busModel");
const Std = require("./models/studentModel");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// mapbox key or token
mapboxgl.accessToken = 'pk.eyJ1IjoiamF5ZXNoLXUiLCJhIjoiY2xqdml5Z2pwMDltczNlcDR5eDh6bHE4ZCJ9.iE4WstOoi83JSin5Z4ECOg';

// Connect to MongoDB
const PORT = process.env.PORT || 3000;

//  || process.env.MONGO_URI
mongoose.connect('mongodb://127.0.0.1:27017/busTrackDB')
    .then(() => {
        console.log('Connected to MongoDB');
        // Continue with the rest of the code here
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });


// //create item schema
// const busSchema = new mongoose.Schema({
//     route: String,
//     busNo: Number,
//     password: String,
//     numberPlate: String,
//     longitude: Number,
//     latitude: Number
// }, { timestamps: true }
// );

// const studentSchema = new mongoose.Schema({
//     usn: String,
//     password: String
// });

// //model item
// const Bus = mongoose.model("bus", busSchema);

// const Std = mongoose.model("student", studentSchema);

//buses
const bus1 = new Bus({
    route: "Mahantesh nagar",
    busNo: 1,
    password: "Mahantesh nagar",
    numberPlate: "KA 22 MC 2166",
    longitude: 74.53642393726847,
    latitude: 15.881915347206428
});
const bus2 = new Bus({
    route: "Hanuman nagar",
    busNo: 10,
    password: "Hanuman nagar",
    numberPlate: "KA 22 MC 2166",
    longitude: 74.48591797126895,
    latitude: 15.876246560391277
});
const bus3 = new Bus({
    route: "Sambra",
    busNo: 3,
    password: "Sambra",
    numberPlate: "KA 22 MC 2166",
    longitude: 74.61385221509138,
    latitude: 15.869056261665328
});

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

const defaultBusItems = [bus1, bus2, bus3];
const defaultStdItems = [std1, std2, std3];

function insertDefaultBusItems() {
    // insertMany items
    Bus.insertMany(defaultBusItems)
        .then(() => {
            console.log("Successfully inserted Bus objects.");
        })
        .catch((error) => {
            console.log("Error inserting array of Bus objects : " + error);
        });
}

function insertDefaultStdItems() {
    // insertMany items
    Std.insertMany(defaultStdItems)
        .then(() => {
            console.log("Successfully inserted Std objects.");
        })
        .catch((error) => {
            console.log("Error inserting array of Std objects : " + error);
        });
}

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/busdriver", function (req, res) {
    Bus.find({})
        .then(function (busList) {
            if (busList.length === 0) {
                insertDefaultBusItems();
                res.redirect("/busdriver");
            } else {
                console.log(busList[0]);
                res.render("busdriver");
            }
        })
        .catch((error) => {
            console.log("Error finding with name: " + error);
        });
});

app.post("/busdriver", function (req, res) {
    const uName = req.body.username;
    const pass = req.body.password;
    Bus.findOne({ busNo: uName })
        .then((foundBus) => {
            if (!foundBus) {
                console.log("Bus not found.");
            } else {
                console.log("Found Bus.");

                // verify password.
                if (foundBus.password === pass) {
                    res.render("trackbus", { foundBus });
                } else {
                    console.log("Wrong password.");
                }
            }
        })
        .catch((err) => {
            console.log("Error finding busDriver : " + err);
        })
});

app.get("/students", function (req, res) {
    Std.find({})
        .then(function (stdList) {
            if (stdList.length === 0) {
                insertDefaultStdItems();
                res.redirect("/students");
            } else {
                console.log(stdList[0]);
                res.render("students");
            }
        })
        .catch((error) => {
            console.log("Error finding with name: " + error);
        });
});

app.post("/students", function (req, res) {
    const uName = req.body.username;
    const pass = req.body.password;
    Std.findOne({ usn: uName })
        .then((foundUser) => {
            if (!foundUser) {
                console.log("User not found.");
                res.redirect("/students");
            } else {
                console.log("Found user.");

                // verify password.
                if (foundUser.password === pass) {
                    Bus.find({})
                        .then(function (busList) {
                            if (busList.length === 0) {
                                insertDefaultBusItems();
                                res.redirect("/map");
                            } else {
                                console.log(busList[0]);
                                res.render("map", { listTitle: "Bus Tracker", busList, foundBus: busList[0] });
                            }
                        })
                        .catch((error) => {
                            console.log("Error finding with name: " + error);
                        });
                } else {
                    console.log("Wrong password.");
                }
            }
        })
        .catch((err) => {
            console.log("Error finding user : " + err);
        })
});

//edit just render track bus after login.
app.post("/trackbus", function (req, res) {
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const busNo = req.body.busNo;
    console.log("Received coordinates - Latitude: " + latitude + ", Longitude: " + longitude + ", foundBus number: " + busNo);

    //Update.
    Bus.updateOne({ busNo: busNo }, { longitude: longitude, latitude: latitude })
        .then(() => {
            console.log("Successfully updated location.");
        })
        .catch((err) => {
            console.log("Error updating location : " + err);
        });

    res.sendStatus(200); // Send a response indicating success
});

function updateMap(busNumber) {
    return new Promise((resolve, reject) => {
        Bus.findOne({ busNo: busNumber })
            .then((foundBus) => {
                if (!foundBus) {
                    console.log("Bus not found..!!");
                    resolve(null);
                } else {
                    console.log("found Bus route: " + foundBus.route);
                    resolve(foundBus);
                }
            })
            .catch((err) => {
                console.log("Error finding Bus no.: " + err);
                reject(err);
            });
    });
}

//shared variable to store the latest location data
let selectedBus = null;

app.post("/map", function (req, res) {
    const busNumber = req.body.busNo;
    console.log(busNumber);

    updateMap(busNumber)
        .then((foundBus) => {
            if (foundBus) {
                console.log(foundBus);
                selectedBus = foundBus;

                Bus.find({})
                    .then(function (busList) {
                        if (busList.length === 0) {
                            insertDefaultBusItems();
                            res.redirect("/map");
                        } else {
                            res.render("map", { listTitle: "Bus Tracker", busList, foundBus });
                        }
                    })
                    .catch((error) => {
                        console.log("Error finding bus list: " + error);
                    });
            } else {
                console.log("Bus not found..!!");
                res.redirect("/map");
            }
        })
        .catch((error) => {
            console.log("Error updating map: " + error);
            res.redirect("/map");
        });
});

//endpoint to fetch the foundBus data through AJAX
app.get("/selectedbus", function (req, res) {
    console.log("trying to fetch");
    const busNo = selectedBus.busNo;
    Bus.findOne({ busNo: busNo })
        .then((foundBus) => {
            if (!foundBus) {
                console.log("Bus not found.");
            } else {
                console.log("Found Bus.");

                console.log(foundBus);
                res.json(foundBus);
            }
        })
        .catch((err) => {
            console.log("Error finding bus : " + err);
        })
    console.log(selectedBus);
    // res.json(selectedBus);
});


app.listen(3000, function () {
    console.log("Server is running on port 3000");
});