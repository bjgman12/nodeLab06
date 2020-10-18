'use strict';

//Dependenceis
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();

// Server listening port

const PORT = process.env.PORT || 3000;

// Start express

const app = express();

// use Cors

app.use(cors());

//Start Server


//Routes

app.get('/', (request, response) => {
  response.send('Default');
});

app.get('/bad', (request, response) => {
  throw new Error('Wrong');
});

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
// Route handlers

function locationHandler(req, res) {
  let city = req.query.city;
  let key = process.env.LOCIQ_API_KEY;
  const URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

  superagent.get(URL)
    .then(data => {
      let location = new Location(city, data.body[0]);
      res.status(200).json(location);
    })
    .catch((error) => {
      console.log('error', error);
      res.status(500).send('API call did not work');
    });
}

function weatherHandler(req, res) {
  let city = req.query.search_query;
  let key = process.env.WEATHER_API_KEY;
  const URL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;

  superagent.get(URL)
    .then(data => {
      let weatherArr = data.body.data.map(function (day) {
        let weather = new Weather(day);
        return weather;
      });
      weatherArr = weatherArr.slice(0, 8);
      res.status(200).json(weatherArr);
    })
    .catch((error) => {
      console.log('error', error);
      res.status(500).send('API call did not work');
    });
}
function trailHandler(req, res) {
  let lat = req.query.latitude;
  let long = req.query.longitude;
  let key = process.env.TRAIL_API_KEY;

  const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}&maxDistance=10&key=${key}`;

  superagent.get(URL)
    .then(data => {
      console.log(data.body);
      let trailArr = data.body.trails.map(function (trail) {
        let newTrail = new Trail(trail);
        return newTrail;
      });
      res.status(200).json(trailArr);
    })
    .catch((error) => {
      console.log('error',error);
      res.status(500).send('Api call did not work');
    });
}
// Constructors

function Location(city, locationData) {
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
  this.search_query = city;
  this.formatted_query = locationData.display_name;
}

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;

}

function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = obj.conditionDate.slice(0, 10);
  this.condition_time = obj.conditionDate.slice(10, obj.conditionDate.length);
}


//Starting Server
app.listen(PORT, () => {
  console.log(`server is now listening on ${PORT}`);
});



