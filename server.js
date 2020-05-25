var express = require("express");
var exphds = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");


var db = require("./models");
var PORT = process.env.PORT || 3000;

var app = express();


app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/scraperHW", { useNewUrlParser: true });



app.engine("handlebars", exphds({defaultLayout: "main"}));
app.set("view engine", "handlebars");

var htmlRoutes = require("./routes/htmlRoutes");
var apiRoutes = require("./routes/apiRoutes");

app.use(htmlRoutes);
app.use(apiRoutes);


// app.get("/", function(req, res) {
//     res.render("index");
// })



app.listen(PORT, function() {
    console.log("App running on port " + PORT);
})
