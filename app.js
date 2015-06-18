var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
session = require("cookie-session"),
methodOverride = require('method-override'),
morgan = require("morgan"),
loginMiddleware = require("./middleware/loginHelper");
routeMiddleware = require("./middleware/routeHelper");

var db = require("./models");


// MIDDLEWARE // ****************************************

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  maxAge: 3600000,
  // sets timeout incase you leave your computer (cookie specific)
  secret: 'illnevertell',
  // how the session decrypts the cookie, what is wrote here
  // doesn't matter....
  name: "chocolate chip"
  // (cookie specific)
}));

// use loginMiddleware everywhere!
app.use(loginMiddleware);


//******************* POST ROUTES *************************//

// ROOT (PUBLIC) //

app.get('/', function(req,res){
  res.redirect("/posts");
});


// INDEX (PUBLIC) //

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


// NEW (RESTRICTED TO LOGGED IN USER) //

app.get('/posts/new', routeMiddleware.ensureLoggedIn, function(req,res){
  res.render("posts/new");
});

// DIRECTED TO THE LOGIN PAGE //

app.get("/login", routeMiddleware.preventLoginSignup, function (req, res) {
  res.render("users/login");
});


// USER SUBMITTS LOGIN FORM! //

app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (!err && user !== null) {
      req.login(user);
      res.redirect("/posts");
    } else {
      // TODO - handle errors in ejs!
      res.render("users/login");
    }
  });
});


// USER NEEDS TO SIGN UP! //

app.get('/signup', routeMiddleware.preventLoginSignup ,function(req,res){
  res.render('users/signup');
});

// USER SUBMITTS SIGN UP FORM! // 

app.post("/signup", function (req, res) {
  var newUser = req.body.user;
  db.User.create(newUser, function (err, user) {
    if (user) {
      req.login(user);
      res.redirect("/posts");
    } else {
      console.log(err);
      // TODO - handle errors in ejs!
      res.render("users/signup", {err:err});
    }
  });
});

// LOGS OUT USER! //

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// CREATE (RESTRICTED TO LOGGED IN USER) //

app.post('/posts', routeMiddleware.ensureLoggedIn, function(req,res){
  var post = new db.Post(req.body.post);
    post.ownerId = req.session.id;
    post.save(function(err,post){
      console.log(post);
      res.redirect("/posts");
    });

  // WITHOUT AUTH!

  // db.Post.create(req.body.post, function(err, post){
  //   if(err) {
  //     console.log(err);
  //     res.render("posts/new");
  //   }
  //   else {
  //     res.redirect("/posts");
  //   }
  // });
});

// SHOW (PUBLIC) //

app.get('/posts/:id', function(req,res){
  db.Post.findById(req.params.id).populate('comments').exec(
    function (err, post) {
        res.render("posts/show", {post:post});
    });
});


// EDIT (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.get('/posts/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserP, function(req,res){
  db.Post.findById(req.params.id).populate('comments').exec(
     function (err, post) {
         res.render("posts/edit", {post:post});
     });
});


// UPDATE (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.put('/posts/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserP, function(req,res){
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


// DESTROY (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.delete('/posts/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserP, 
  function(req,res){
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


// INDEX (PUBLIC) //

app.get('/posts/:post_id/comments', function(req,res){
  db.Post.findById(req.params.post_id).populate('comments').exec(function(err,post){
    res.render("comments/index", {post:post});
  });
});


// NEW (RESTRICTED TO LOGGED IN USER) //

app.get('/posts/:post_id/comments/new', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Post.findById(req.params.post_id,
    function (err, post) {
      res.render("comments/new", {post:post});
    });
});


// CREATE (RESTRICTED TO LOGGED IN USER) //

app.post('/posts/:post_id/comments', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Comment.create(req.body.comment, function(err, comments){
    if(err) {
      console.log(err);
      res.render("comments/new");
    }
    else {
      db.Post.findById(req.params.post_id,function(err,post){
        post.comments.push(comments);
        comments.post = post._id;
        comments.ownerId = req.session.id;
        comments.save();
        post.save();
        console.log(comments);
        res.redirect("/posts/"+ req.params.post_id +"/comments");
      });
    }
  });
});


// SHOW (PUBLIC) //

app.get('/comments/:id', function(req,res){
  db.Comment.findById(req.params.id)
    .populate('post')
    .exec(function(err,comment){
      res.render("comments/show", {comment:comment});
    });
});


// EDIT (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.get('/comments/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserC, 
  function(req,res){
  db.Comment.findById(req.params.id, function(err,comment){
      res.render("comments/edit", {comment:comment});
    });
});


// UPDATE (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.put('/comments/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserC,
  function(req,res){
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


// DESTROY (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.delete('/comments/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserC,
  function(req,res){
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