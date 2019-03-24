const log = console.log;
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

let tasks = [];

app.get("/", (req,res) => {
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = today.toLocaleDateString("en-US", options);

    res.render("list", {day: day, tasks: tasks});
});

app.post("/", (req,res) => {
    const newTask = req.body.newTask;
    tasks.push(newTask);
    res.redirect("/");
});

app.listen(3001, () => {
    log("server is running on port 3001")
});