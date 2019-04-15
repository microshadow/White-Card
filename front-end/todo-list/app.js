const log = console.log;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// connect to mongo server
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});
// create Schema
const ItemSchema = new mongoose.Schema({
    name: String,
});
// create model
const Item = mongoose.model("Item", ItemSchema);
// create document
const item1 = new Item({
    name: "学习！"
});

const item2 = new Item({
    name: "看球：利物浦 vs 切尔西"
});

const item3 = new Item({
    name: "健身：卧推，深蹲各7组，无氧30分钟"
});

const ListSchema = new mongoose.Schema({
    name: String,
    items: [ItemSchema]
});

const List = mongoose.model("list", ListSchema);

let tasks = [item1, item2, item3];

app.get("/", (req,res) => {
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = today.toLocaleDateString("en-US", options);

    if (tasks.length === 0){
        // save to mongoDB
        Item.insertMany(tasks, err =>{
            if (err){
                log(err);
            } else {
                log("added new task items to todolist")
            }
        });
        res.redirect("/")
    } else {
        Item.find({}, (err, found) =>{
            res.render("list", {day: day, tasks: found});
        });
    }
});

app.get("/:customListName", (req,res) => {
    const customeListName = req.params.customListName;
    List.findOne({name:customeListName}, (err,result) => {
        if (!result){
            let list = new List({name:customeListName, items:tasks});
            list.save();
            res.redirect("/" + customeListName);
        } else {
            res.render("list", {day: customeListName, tasks: result.items})
        }
    });
});

app.post("/", (req,res) => {
    const newTask = req.body.newTask;
    const newItem = new Item({name:newTask});
    const listName = req.body.list;
    // define today
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = today.toLocaleDateString("en-US", options);

    if (listName === day){
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, (err,found) => {
            if (!err){
                found.items.push(newItem);
                found.save();
                res.redirect("/" + listName);
            }
        });
    }

});

app.post("/delete", (req,res) => {
    const checkedId = req.body.checkbox;
    const listName = _.capitalize(req.body.listName);
    // define today
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = today.toLocaleDateString("en-US", options);

    if (listName === day){
        Item.findByIdAndRemove(checkedId, e => {
            log("deleted id: " + checkedId);
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},(err,result) =>{
            if (!err){
                res.redirect("/" + listName);
            }
        });
    }
});

app.listen(3001, () => {
    log("server is running on port 3001")
});