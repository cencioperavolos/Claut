'use strict'

const express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    path = require("path"),
    wordsRoute = require("./routers/wordsRoute"),
    methodOverride = require("method-override");


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/words", wordsRoute);

// Definne path for Express config and Setup static dir to serve
const publicDirectoryPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicDirectoryPath));

app.set("view engine", "ejs");

// MONGOOSE CONFIG AND CONNECT
const databaseUrl = process.env.DATABASEURL || 'mongodb://localhost/';
const databseName = 'vocabolario_clautano';
mongoose.connect(databaseUrl + databseName,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
        autoIndex: true
    }).then(() => {
        console.log('Connected to DB.')
    }).catch((err) => {
        console.log("Problems on connecting to DB", err);
    });

app.get("/", (req, res) =>{
    res.redirect("/words");
});

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Server is up on port: ' + port)
})