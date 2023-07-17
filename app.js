require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
const session = require("express-session");
var MongoDBSession = require('connect-mongodb-session')(session);

const Bus = require("./models/busModel");
const Std = require("./models/studentModel");

const defaultBusItems = require("./defaultItemsInDB/buses");
const defaultStdItems = require("./defaultItemsInDB/students");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// mapbox key or token
mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

// Connect to MongoDB
const PORT = process.env.PORT || 3000;
const MongoURI = 'mongodb://127.0.0.1:27017/busTrackDB';

// process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/busTrackDB'  
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to MongoDB');
        // Continue with the rest of the code here
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const store = new MongoDBSession({
    // uri: MongoURI,
    uri: process.env.MONGO_URI,
    collection: "mySessions",
});

//sessions
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 10800000 , // 3 hour in milliseconds
        sameSite: 'strict'
    },
}));

const isAuth = (req, res, next) => {
    // console.log(store);
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect("/");
    }
}

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
    // req.session.isAuth = true;
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

                if (foundBus.password === pass) {
                    req.session.isAuth = true;
                    req.session.selectedBus = foundBus;
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
                    req.session.isAuth = true;

                    Bus.find({})
                        .then(function (busList) {
                            if (busList.length === 0) {
                                insertDefaultBusItems();
                                res.redirect("/students");
                            } else {
                                console.log(busList[0]);
                                selectedBus = busList[0];
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
app.post("/trackbus", isAuth, function (req, res) {
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
// let selectedBus = null;

app.post("/map", isAuth, function (req, res) {
    const busNumber = req.body.busNo;
    console.log(busNumber);

    updateMap(busNumber)
        .then((foundBus) => {
            if (foundBus) {
                console.log(foundBus);
                req.session.selectedBus = foundBus;

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
app.get("/selectedbus", isAuth, function (req, res) {
    //const selectedBus = req.session.selectedBus; // Retrieve the selected bus from the session

    if (!selectedBus) {
        console.log("Bus not found. /selectedBus");
        res.sendStatus(404);
    } else {
        console.log("Found Bus. /selectedBus");

        Bus.findOne({busNo: req.session.selectedBus.busNo})
        .then((foundBus)=>{
            if(foundBus){
                //console.log("found one bus : "+ foundBus.longitude +" "+ foundBus.latitude);
                res.json(foundBus);
            }else{
                console.log("bus not match.");
            }
        })
        .catch((err)=>{
            console.log(err);
        })
    }
});


app.listen(3000, function () {
    console.log("Server is running on port 3000");
});