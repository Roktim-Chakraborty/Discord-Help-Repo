const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const defaultItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose
  .connect("mongodb://0.0.0.0:27017/toDoListDB")
  .then(() => console.log("Connection SuccesFul \n"))
  .catch((err) => console.log("The error was: " + err));

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

const createDocument1 = async () => {
  try {
    const item1 = new Item({
      name: "Brush Your Teeth"
    });

    const item2 = new Item({
      name: "Wash Your Face"
    });

    const item3 = new Item({
      name: "Eat Your BreakFast"
    });

    const defaultItems = await Item.insertMany([item1, item2, item3]);

  } catch (err) {
    console.log("The error was: " + err);
  }
};


app.get("/", function (req, res) {

  Item.find().then((items) => {

    if (items === 0) {

      createDocument1();
      res.redirect("/");

    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: items

      });
    }
  });
});

app.get('/:topic', function (req, res) {
  const customListName = req.params.topic;

  List.findOne({
    name: customListName
  }).then((err, foundList) => {
    if (!err)
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list",{
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
  });
  
});



app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  item.save();
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const idOfChecked = req.body.deleteOnChecked;
  console.log(req.body.checkbox);
  Item.findByIdAndDelete(idOfChecked)
    .then((err) => {
      console.log("The error was: \n" + err);
      res.redirect("/");
    });
});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});