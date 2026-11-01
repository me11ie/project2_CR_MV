//import express library
let express = require("express");

//run express
let app = express();

//route for the home page
//serve everything in the public folder
app.use(express.static("public"));


//initiate waiting on ports
app.listen(3000, () => {
    console.log("app is listening");
});