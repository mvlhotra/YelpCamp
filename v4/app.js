const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  mongoose = require('mongoose'),
  Campground = require('./models/campground'),
  Comment = require('./models/comment'),
  seedDB = require('./seeds')

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Campground.create({ name: 'Mtn Goat Rest', image: "https://farm2.staticflickr.com/1363/1342367857_2fd12531e7.jpg", description: "Quinoa put a bird on it shoreditch chartreuse synth etsy banjo normcore kombucha pug bitters pop-up. Migas snackwave messenger bag selvage locavore kickstarter austin street art umami hella thundercats meggings pabst air plant. Gochujang hell of semiotics, 90's irony put a bird on it plaid flexitarian. Man braid pok pok tofu chillwave butcher poke squid." }, function (err, campground) {
//   if (err) {
//     throw err;
//   }
//   console.log('added ', campground);
// });


app.get('/', function (req, res) {
  res.render("landing");
});

app.get("/campgrounds", function (req, res) {
  Campground.find({}, function (err, allCampgrounds) {
    if (err) {
      throw err;
    }
    res.render("campgrounds/index", { campgrounds: allCampgrounds });
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


app.get("/campgrounds/:id/comments/new", function (req, res) {
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

app.listen(process.env.PORT || 8080, () => {
  console.log(`app on http://localhost:8080/`);
});
