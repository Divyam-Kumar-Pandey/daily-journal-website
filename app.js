const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const databaseName = "blogDB";
const options = {family: 4};
const mongodbConnectionString = "mongodb+srv://divyamkumarp:zdH0g6S6pScisqSj@cluster0.m9jsvbr.mongodb.net/" + databaseName;

const postsSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postsSchema);

app.use(express.static(__dirname + "/public"));

// sample posts
const post1 = new Post({
  title: "Day 1",
  content:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In id condimentum nisi, eget mollis mauris. Nullam consectetur in tellus non convallis. Fusce ultricies arcu bibendum ante faucibus euismod. Aliquam eget bibendum risus. In sit amet massa commodo nisi posuere mattis. Aliquam interdum, metus nec venenatis viverra, arcu sem tincidunt libero, tristique egestas elit metus eget leo. Proin ut massa non nibh euismod luctus. Integer luctus mollis lacinia. Aliquam erat volutpat. Sed ac tellus a metus fringilla suscipit. Nam pulvinar turpis lacus, eget ultrices ex ultricies quis. Donec faucibus quam tortor, id vehicula ante eleifend vel. Interdum et malesuada fames ac ante ipsum primis in faucibus.Pellentesque mollis orci nec mi eleifend feugiat vitae in sem. Proin vulputate, quam efficitur porttitor pellentesque, mauris nisl gravida augue, at efficitur arcu est ut ante. Cras eros nunc, pharetra sit amet sollicitudin vitae, facilisis sed quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed facilisis purus. In hac habitasse platea dictumst. In egestas metus ut lacus luctus porttitor."
});

const post2 = new Post({
  title: "Day 2",
  content: `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;700&display=swap');

    body{
        padding: 0;
        margin: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
    .header{
        background-color: #faf6fa;
        color: #9c989c;
        margin : 0 0 0 0;
        display: grid;
        grid-template-columns: 7fr 3fr;
        width: 100%;
    }
    
    
    #title{
        padding-left: 10rem;
        font-family: 'Montserrat', sans-serif;
        font-weight: 100 !important;
    }
    
    .pages{
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        padding-right: 5%;
    }
    
    .pages a{
        text-decoration: none;
        color: #9c989c;
        font-family: 'Montserrat', sans-serif;
        font-weight: 300;
        font-size: 1.2em;
    }
    
    .pages a:hover{
        color: #74c9b7;
    }
    
    .footer{
        background-color: #74c9b7;
        color: #faf6fa;
        margin : 0;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: auto;
    }
    
    .body {
        margin : 0 10rem;
        display: flex;
        flex-direction: column;
    }
    
    .body h1{
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        font-size: 2rem;
    }
    
    .body pre{
        font-family: 'Montserrat', sans-serif;
        font-weight: 300;
        font-size: 1.2em;
        white-space: pre-wrap;
    }
    
    .body p{
        font-family: 'Montserrat', sans-serif;
        font-weight: 300;
        font-size: 1.2em;
    }
    
    .body input, .body label{
        margin: 0.5rem 0;
    }
    
    .body button {
        background-color: #74c9b7;
        color: #faf6fa;
        border: none;
        border-radius: 5px;
        padding: 0.5rem 1rem;
        font-family: 'Montserrat', sans-serif;
        font-weight: 300;
        font-size: 1.2em;
        cursor: pointer;
        margin-top: 1rem;
        width: min-content;
    }
    
    .body a{
        text-decoration: none;
        color: #007BFF;
    }
    
    
    `
});

var postsHere = [post1, post2];
var insertedPost = {};

async function getPosts() {
  await mongoose.connect(mongodbConnectionString, options);

  var docCount = 0;
  await Post.countDocuments().then((count) => {
    docCount = count;
    console.log("Document count: " + docCount);
  });

  if (docCount === 0) {
    await Post.insertMany(postsHere);
  } else {
    console.log("postsHere array length: " + postsHere.length);
    postsHere = [];
    await Post.find().then(function (foundItems) {
      // console.log(foundItems);
      foundItems.forEach((element) => {
        postsHere.push(element);
        // console.log(element);
      });
      // console.log(items);
    });
  }
  // console.log("Closing MongoDB connection...");
  await mongoose.connection.close();
}

async function addPost(newPost) {
  // console.log("Connecting to MongoDB...");
  await mongoose.connect(mongodbConnectionString, options);
  // console.log("Connected to MongoDB");

  const post = new Post({
    title: newPost.title,
    content: newPost.content
  });

  await post.save();

  await mongoose.connection.close();
}

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});

app.post("/delete", async function (req, res) {
  console.log(req.body.title);
  await mongoose.connect(mongodbConnectionString, options);
  await Post.deleteOne({title: req.body.title});
  await mongoose.connection.close();
  res.redirect("/");
});

app.post("/edit", async function (req, res) {
    console.log(req.body.title);
    res.render("editPost", {title: req.body.title, content: req.body.content});
});

app.post("/editPost", async function (req, res) {
    const postID = req.body.oldTitle;
    const _postContent = req.body.postContent;
    const _newTitle = req.body.newTitle;
    console.log(postID);
    console.log(_postContent);
    console.log(_newTitle);

    await mongoose.connect(mongodbConnectionString, options).then(() => {
        console.log("Connected to MongoDB");
    });

    await Post.findOneAndReplace({title: postID}, {content: _postContent, title: _newTitle}).then(() => {
        console.log("Updated post");
    });
    await Post.findOne({title: _newTitle}).then((foundItem) => {
        console.log(foundItem);
    });
    await mongoose.connection.close();
    res.redirect("/posts/" + _newTitle);

    //update the postsHere array
    const post = postsHere.indexOf(req.body.title) + 1;
    console.log(post);
    postsHere[post].title = _newTitle;
    postsHere[post].content = _postContent;

    console.log(postsHere[post]);

    // await getPosts();
});


app.get("/", async function (req, res) {
  await getPosts();
  res.render("home", {
    posts: postsHere
  });
});

app.get("/about", function (req, res) {
  res.render("about", {});
});

app.get("/contact", function (req, res) {
  res.render("contact", {});
});

app.get("/compose", function (req, res) {
  res.render("compose", {});
});

app.post("/compose", async function (req, res) {
  insertedPost = {
    title: _.capitalize(req.body.title),
    content: req.body.post
  };
  await addPost(insertedPost);
  postsHere.push(insertedPost);

  res.redirect("/");
});

app.get("/posts/:postID", async function (req, res) {
  await getPosts();
  let requestedTitle = req.params.postID;
  requestedTitle = _.capitalize(requestedTitle);
  postsHere.forEach(function (post) {
    let storedTitle = post.title;
    storedTitle = _.capitalize(storedTitle);
    // console.log(storedTitle);
    if (storedTitle === requestedTitle) {
      // console.log("Match found");
      res.render("post", {
        title: _.capitalize(post.title),
        content: post.content
      });
    }
  });
});
