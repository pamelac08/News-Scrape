var express = require("express");
var exphds = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

var PORT = process.env.PORT || 3000;

var app = express();


app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperHW";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


app.engine("handlebars", exphds({defaultLayout: "main"}));
app.set("view engine", "handlebars");

var routes = require("./routes/routes");
app.use(routes);


app.listen(PORT, function() {
    console.log("App running on port " + PORT);
})
