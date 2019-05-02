const express = require('express');
const app = express();

app.set("view engine", "ejs");

app.get('/', function (req, res) {
  res.render("landing");
});

app.get("/campgrounds", function (req, res) {
  const campgrounds = [
    { name: 'Salmon Creek', image: "https://farm8.staticflickr.com/7252/7626464792_3e68c2a6a5.jpg" },
    { name: 'Forest Hill', image: "https://farm4.staticflickr.com/3282/2770447094_2c64348643.jpg" },
    { name: 'Mtn Goat Rest', image: "https://farm2.staticflickr.com/1363/1342367857_2fd12531e7.jpg" },
  ];
  res.render("campgrounds", { campgrounds: campgrounds });
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`app on http://localhost:8080/`);
});
