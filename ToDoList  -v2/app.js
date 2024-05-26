// Require
const express  = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
main().catch(err => console.log(err));


const app = express();

// App Set & Use
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




// Mongoose Connect
async function main() {
  await mongoose.connect('mongosh "mongodb+srv://cluster0.0o0oqi1.mongodb.net/" --apiVersion 1 --username giorgosmintis');
};

// Schemas
const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

//Models
const Item = mongoose.model('Item', itemsSchema);

const List = mongoose.model("List", listSchema);

// DB Constants 
const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];




// Arrays
const items = ["Buy Food","Cook Food", "Eat Food"];
const workItems = [];


// App -- Get
app.get("/",function(req,res) {
  

  Item.find({}).then(function(foundItems){
    
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems);
      console.log("Successfully saved default items to DB");
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
  .catch(function(err){
    console.log(err);
  });
});


app.get("/:customListName",function(req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        console.log("Saved");
        res.redirect("/"+customListName);
      }
      else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
    ).catch(function(err) {

    })
});
  

app.get("/about", function(req,res) {
  res.render("about");
});



// App -- Post
app.post("/", function(req,res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});



app.post("/work",function() {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
})


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
     Item.findByIdAndRemove(checkedItemId)
    .then(function () {
      console.log("Item "+checkedItemId+" removed succesfully");
    })
    .catch(function(err) {
       console.log(err);
    });
    res.redirect("/");
    } else {
      List.findOneAndUpdate(
        {name: listName},
        {$pull: {items:{_id: checkedItemId}}}).then(function(foundList){
          res.redirect("/"+listName);
        })    
      }  
});



// Listen on Port
app.listen(3000,function() {
  console.log("Server started on port 3000");
});


