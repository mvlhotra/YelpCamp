const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  Campground = require('./models/campground'),
  Comment = require('./models/comment'),
  User = require('./models/user'),
  seedDB = require('./seeds')

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

//  passport config

app.use(require("express-session")({
  secret: "slatt",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.get('/', function (req, res) {
  res.render("landing");
});

app.get("/campgrounds", function (req, res) {
  Campground.find({}, function (err, allCampgrounds) {
    if (err) {
      throw err;
    }
    res.render("campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user });
  });
});

app.post("/campgrounds", function (req, res) {
  const name = req.body.name;
  const image = req.body.image;
  const desc = req.body.description;
  const newCampground = { name: name, image: image, description: desc }
  Campground.create(newCampground, function (err, newlyCreated) {
    if (err) {
      throw err;
    }
    res.redirect('/campgrounds');
  });
});

app.get("/campgrounds/new", function (req, res) {
  res.render('campgrounds/new');
});

app.get("/campgrounds/:id", function (req, res) {
  Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
    if (err) {
      throw err;
    }
    res.render('show', { campground: foundCampground });
  });
});

app.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      throw err;
    }
    res.render('comments/new', { campground: campground });
  });
});

app.post('/campgrounds/:id/comments', function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      res.redirect('/campgrounds');
      console.log(err);
    }
    Comment.create(req.body.comment, function (err, comment) {
      if (err) {
        throw err;
      }
      campground.comments.push(comment);
      campground.save();
      res.redirect("/campgrounds/" + campground._id);
    });
  })
});

//  auth routes
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log('Error registering user: ', err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect('/campgrounds');
    });
  });

});

app.get("/login", function (req, res) {
  res.render('login');
});

app.post('/login', passport.authenticate("local",
  {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
  }), function (req, res) {

  });

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/campgrounds');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(process.env.PORT || 8080, () => {
  console.log(`app on http://localhost:8080/`);
});
