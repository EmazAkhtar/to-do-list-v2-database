//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const _= require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todoListDB",{useNewUrlParser: true});

const itemsSchema= {
  name: String
};
// this line of code makes a collection 
const Item= new mongoose.model("Item",itemsSchema);

const item1= new Item ({
  name: "Welcome to your todolist"
});
const item2= new Item ({
  name: "press + to add any item"
});
const item3= new Item ({
  name: "press this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema= {
  name: String,
  item:[itemsSchema]
}
const List = new mongoose.model("List",listSchema);

app.get("/", function(req, res){

  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
       console.log(err);
      }
      else{
       console.log("successsfully saved");
      }
    });
    res.redirect("/");
  }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

  app.get("/:customListName",function(req,res){
    const customListName= _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
      if(!err){
        if(!foundList){
          const list= new List({
            name: customListName,
            item:defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
        }
        else{
          res.render("list",{listTitle: customListName, newListItems: foundList.item});
        }
      }

    });
   
});

app.post("/", function(req, res){
  const listName= req.body.list;
  const listItem= req.body.newItem;

  // no matter from which list it came we have to create an item doc 
  const item= new Item({
    name: listItem
  });

  if(listName=== "Today"){
  item.save();
  res.redirect("/");
  }

  else{
    List.findOne({name:listName},function(err,foundList){
      if(!err){
        foundList.item.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }
});

app.post("/delete",function(req,res){
    
    const checkedItemId=req.body.checkbox;
    const listName= req.body.listName;

    if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId,function(err){
        if(!err){
         console.log("successfully deleted");
         res.redirect("/");
        }
     });
    }
    else{
      List.findOneAndUpdate({name: listName}, {$pull: {item: {_id:checkedItemId}}},function(err,foundItem){
        if(!err){
          res.redirect("/" + listName);
        }

      })
    }
    

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
