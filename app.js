var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
methodOverride = require('method-override'),
morgan = require("morgan"),
db = require("./models");


// MIDDLEWARE //

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));


//******************* POST ROUTES ***************************//

// ROOT //

app.get('/', function(req,res){
  res.redirect("/posts");
});


// INDEX //

app.get('/posts', function(req,res){
  db.Post.find({},
    function (err, posts) {
       if(err) {
      console.log(err);
      res.render("errors/500");
    }
    else {
      res.render("posts/index", {posts:posts});
    }

    });
});


// NEW //

app.get('/posts/new', function(req,res){
  res.render("posts/new");
});


// CREATE //

app.post('/posts', function(req,res){
  db.Post.create(req.body.post, function(err, post){
    if(err) {
      console.log(err);
      res.render("posts/new");
    }
    else {
      res.redirect("/posts");
    }
  });
});

// SHOW //

app.get('/posts/:id', function(req,res){
  db.Post.findById(req.params.id).populate('comments').exec(
    function (err, post) {
        res.render("posts/show", {post:post});
    });
});


// EDIT //

app.get('/posts/:id/edit', function(req,res){
  db.Post.findById(req.params.id).populate('comments').exec(
     function (err, post) {
         res.render("posts/edit", {post:post});
     });
});


// UPDATE //

app.put('/posts/:id', function(req,res){
 db.Post.findByIdAndUpdate(req.params.id, req.body.post,
     function (err, post) {
       if(err) {
         res.render("posts/edit");
       }
       else {
         res.redirect("/posts");
       }
     });
});


// DESTROY //

app.delete('/posts/:id', function(req,res){
  db.Post.findById(req.params.id,
    function (err, post) {
      if(err) {
        console.log(err);
        res.render("posts/show");
      }
      else {
        post.remove();
        res.redirect("/posts");
      }
    });
});


//******************* COMMENT ROUTES ***********************//


// INDEX //

app.get('/posts/:post_id/comments', function(req,res){
  db.Post.findById(req.params.post_id).populate('comments').exec(function(err,post){
    res.render("comments/index", {post:post});
  });
});


// NEW //

app.get('/posts/:post_id/comments/new', function(req,res){
  db.Post.findById(req.params.post_id,
    function (err, post) {
      res.render("comments/new", {post:post});
    });
});


// CREATE //

app.post('/posts/:post_id/comments', function(req,res){
  db.Comment.create(req.body.comment, function(err, comments){
    if(err) {
      console.log(err);
      res.render("comments/new");
    }
    else {
      db.Post.findById(req.params.post_id,function(err,post){
        post.comments.push(comments);
        comments.post = post._id;
        comments.save();
        post.save();
        console.log(comments);
        res.redirect("/posts/"+ req.params.post_id +"/comments");
      });
    }
  });
});


// SHOW //

app.get('/comments/:id', function(req,res){
  db.Comment.findById(req.params.id)
    .populate('post')
    .exec(function(err,comment){
      res.render("comments/show", {comment:comment});
    });
});


// EDIT //

app.get('/comments/:id/edit', function(req,res){
  db.Comment.findById(req.params.id, function(err,comment){
      res.render("comments/edit", {comment:comment});
    });
});


// UPDATE //

app.put('/comments/:id', function(req,res){
 db.Comment.findByIdAndUpdate(req.params.id, req.body.comment,
     function (err, comment) {
      // console.log("Comment!", comment);
       if(err) {
         res.render("comments/edit");
       }
       else {
         res.redirect("/posts/" + comment.post + "/comments");
       }
     });
});


// DESTROY //

app.delete('/comments/:id', function(req,res){
 db.Comment.findByIdAndRemove(req.params.id,
      function (err, comment) {
        if(err) {
          console.log(err);
          res.render("comments/edit");
        }
        else {
          res.redirect("/posts/" + comment.post  + "/comments");
        }
      });
});























// CATCH ALL //
app.get('*', function(req,res){
  res.render('errors/404');
});

// START SERVER //
app.listen(3000, function(){
  console.log("Server is listening on Port: 3000");
});


// NOTES! **********************************************

// var express = require("express"),
// app = express(),
// bodyParser = require("body-parser"),
// methodOverride = require('method-override'),
// morgan = require("morgan"),
// db = require("./models");

// app.set('view engine', 'ejs');
// app.use(morgan('tiny'));
// app.use(methodOverride('_method'));
// app.use(express.static(__dirname + '/public'));
// app.use(bodyParser.urlencoded({extended:true}));

// // ROOT
// app.get('/', function(req,res){
//   res.redirect("/zoos");
// });

// // INDEX
// app.get('/zoos', function(req,res){
//   db.Zoo.find({},
//     function (err, zoos) {
//       res.render("zoos/index", {zoos:zoos});
//     });
// });

// // NEW
// app.get('/zoos/new', function(req,res){
//   res.render("zoos/new");
// });

// // CREATE
// app.post('/zoos', function(req,res){
//   db.Zoo.create(req.body.zoo, function(err, zoo){
//     if(err) {
//       console.log(err);
//       res.render("zoos/new");
//     }
//     else {
//       res.redirect("/zoos");
//     }
//   });
// });

// // SHOW
// app.get('/zoos/:id', function(req,res){
//   db.Zoo.findById(req.params.id).populate('animals').exec(
//     function (err, zoo) {
//         res.render("zoos/show", {zoo:zoo});
//     });
// });

// // EDIT
// app.get('/zoos/:id/edit', function(req,res){
//   db.Zoo.findById(req.params.id).populate('animals').exec(
//      function (err, zoo) {
//          res.render("zoos/edit", {zoo:zoo});
//      });
// });

// // UPDATE
// app.put('/zoos/:id', function(req,res){
//  db.Zoo.findByIdAndUpdate(req.params.id, req.body.zoo,
//      function (err, zoo) {
//        if(err) {
//          res.render("zoos/edit");
//        }
//        else {
//          res.redirect("/zoos");
//        }
//      });
// });

// // DESTROY
// app.delete('/zoos/:id', function(req,res){
//   db.Zoo.findById(req.params.id,
//     function (err, zoo) {
//       if(err) {
//         console.log(err);
//         res.render("zoos/show");
//       }
//       else {
//         zoo.remove();
//         res.redirect("/zoos");
//       }
//     });
// });

// /********* Animals ROUTES *********/

// // INDEX
// app.get('/zoos/:zoo_id/animals', function(req,res){
//   db.Zoo.findById(req.params.zoo_id).populate('animals').exec(function(err,zoo){
//     res.render("animals/index", {zoo:zoo});
//   });
// });

// // NEW
// app.get('/zoos/:zoo_id/animals/new', function(req,res){
//   db.Zoo.findById(req.params.zoo_id,
//     function (err, zoo) {
//       res.render("animals/new", {zoo:zoo});
//     });
// });

// // CREATE
// app.post('/zoos/:zoo_id/animals', function(req,res){
//   db.Animal.create(req.body.animal, function(err, animals){
//     if(err) {
//       console.log(err);
//       res.render("animals/new");
//     }
//     else {
//       db.Zoo.findById(req.params.zoo_id,function(err,zoo){
//         zoo.animals.push(animals);
//         animals.zoo = zoo._id;
//         animals.save();
//         zoo.save();
//         res.redirect("/zoos/"+ req.params.zoo_id +"/animals");
//       });
//     }
//   });
// });

// // SHOW
// app.get('/animals/:id', function(req,res){
//   db.Animal.findById(req.params.id)
//     .populate('zoo')
//     .exec(function(err,animal){
//       res.render("animals/show", {animal:animal});
//     });
// });

// // EDIT
// app.get('/animals/:id/edit', function(req,res){
//   db.Animal.findById(req.params.id, function(err,animal){
//       res.render("animals/edit", {animal:animal});
//     });
// });

// // UPDATE
// app.put('/animals/:id', function(req,res){
//  db.Animal.findByIdAndUpdate(req.params.id, req.body.animal,
//      function (err, animal) {
//       console.log("ANIMAL!", animal);
//        if(err) {
//          res.render("animals/edit");
//        }
//        else {
//          res.redirect("/zoos/" + animal.zoo + "/animals");
//        }
//      });
// });

// // DESTROY
// app.delete('/animals/:id', function(req,res){
//  db.Animal.findByIdAndRemove(req.params.id,
//       function (err, animal) {
//         if(err) {
//           console.log(err);
//           res.render("animals/edit");
//         }
//         else {
//           res.redirect("/zoos/" + animal.zoo  + "/animals");
//         }
//       });
// });

// // CATCH ALL
// app.get('*', function(req,res){
//   res.render('errors/404');
// });

// // START SERVER
// app.listen(3000, function(){
//   console.log("Server is listening on port 3000");
// });
