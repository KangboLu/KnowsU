// required packages
var express = require("express");
var app = express();
var bodyParser  = require("body-parser");
var request = require("request");
var books = require('google-books-search');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

// set view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// configuration for tone_analyzer
var tone_analyzer = new ToneAnalyzerV3({
  username: 'your-username',
  password: 'your-password',
  version_date: 'API version date'
});

// Root route
app.get("/", function(req, res){
    res.render("home");
});

// New Route
app.get("/new", function(req, res){
  res.render("new");
});

// global tones
var first, inverse, min;

// CREATE ROUTE
app.post("/index", function(req, res){
  tone_analyzer.tone({ text: req.body.text }, function(err, tone) {
    if (err) {
      // error handling for the tone analyzer
      console.log(err);
      res.redirect("/new");
    }
    else {
      // read data from the response and determinter the maximum tone percentage
      var data = JSON.parse(JSON.stringify(tone.document_tone.tone_categories[0].tones, null, 2));
      min = 0;
      data.forEach(function(tone){
        if (tone['score'] > min) {
          first = tone['tone_name'];
          min = tone['score'];
        }
      })
      
      // determine the minimum percentage to help assist giving recommendation
      var max = 1;
      data.forEach(function(tone){
        if (tone['score'] < max) {
          inverse = tone['tone_name'];
          max = tone['score'];
        }
      })
      // redirect the website to index after making a get request
      res.redirect("/index");
    }
  });
});

// a getRandom function to get a random number between 0 to 4
function getRandom() {
  return Math.floor(Math.random() * 4);
}

// create arrays of emotional words to create randomized query search words
var query = "";
var sadness = ["sad", "upset", "broken", "melancholy", "cry"];
var joy = ["happy", "fun", "peace", "delight", "bliss"];
var anger = ["safe", "calm", "peace", "pleasure", "relax"];
var fear = ["dangerous", "fire", "safe", "joy", "ease"]
var disgust = ["calm", "excited", "interested", "delicious", "joyful"];

// using getQuery function to get random emotional words base on API response
function getQuery() {
  if (first == "sadness")
    query = sadness[getRandom()];
  else if (first == "joy")
    query = joy[getRandom()];
  else if (first == "anger")
    query = anger[getRandom()];
  else if (first == "fear")
    query = fear[getRandom()];
  else if (first == "disgust")
    query = disgust[getRandom()];
  else
    query = joy[getRandom()];
}

// SHOW route
app.get("/index", function(req, res){
  getQuery();
  
  // send request through spotify API
  var url = 'https://api.spotify.com/v1/search?q=' + query  + '&type=album&offset=0&limit=6';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var parsedData = JSON.parse(body);
      var albumData = parsedData["albums"]["items"];
      
      // send request through omdb API
      url = "http://www.omdbapi.com/?s=" + query;
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          parsedData = JSON.parse(body);
          var movieData = parsedData["Search"]
          
          // search books with Google book API
          books.search(query, function(error, results) {
            if (!error) {
              console.log(results);
              res.render("index", {first: first, score: Math.floor(min * 100), data: albumData, data2: movieData, data3: results});
            } else {
              console.log(error);
              }
          });
        }
      });
    }
  });
});

// start the server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started!");
});
