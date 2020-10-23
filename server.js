'use strict';

//Dependenceis
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

// Server listening port

const PORT = process.env.PORT || 8080;

// Start express

const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
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

  //checking for exsisting DB

  const URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

  //create SQL code
  const sqlCheck = `SELECT * FROM locations WHERE search_query=$1`;
  //Use sql code
  client.query(sqlCheck, [city])
    .then(result => {
      if (result.rowCount) {
        console.log('cashed results used for location');
        res.status(200).json(result.rows[0]);
      } else {
        superagent.get(URL)
          .then(data => {
            let location = new Location(city, data.body[0]);
            //create sql code
            const sqlPlace = `INSERT INTO locations (latitude,longitude,search_query,formatted_query) VALUES ($1,$2,$3,$4) RETURNING *`;
            //use sql code
            client.query(sqlPlace, [location.latitude, location.longitude, location.search_query, location.formatted_query])
              .then(results => {
                res.status(200).json(location);
              })
              .catch((error) => {
                console.log('error', error);
                res.status(500).send('FUCK');
              });
          })
          .catch((error) => {
            console.log('error', error);
            res.status(500).send('API call did not work');
          });
      }
    });
}

function weatherHandler(req, res) {
  let city = req.query.search_query;
  let key = process.env.WEATHER_API_KEY;
  const URL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;

  //create SQL code
  const sqlCheck = `SELECT * FROM weather WHERE search_query=$1`;

  client.query(sqlCheck, [city])
    .then(result => {
      if (result.rowCount) {
        res.status(200).json(result.rows);
        console.log('Cached results used for weather');
      } else {
        superagent.get(URL)
          .then(data => {
            let weatherArr = data.body.data.map(function (day) {
              let weather = new Weather(day);
              weather.search_query = city;
              return weather;
            });
            weatherArr = weatherArr.slice(0, 8);
            const sqlPlace = `INSERT INTO weather (search_query,forecast,time) VALUES ($1,$2,$3)`;
            weatherArr.forEach(entry => {
              client.query(sqlPlace, [entry.search_query, entry.forecast, entry.time])
                .then(results => {
                  console.log('Successfull Cache');
                });
            });
            res.status(200).json(weatherArr);
          })
          .catch((error) => {
            console.log('error', error);
            res.status(500).send('API call did not work');
          });
      }
    });
}
function trailHandler(req, res) {
  let lat = req.query.latitude;
  let long = req.query.longitude;
  let key = process.env.TRAIL_API_KEY;
  let city = req.query.search_query;
  const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}&maxDistance=10&key=${key}`;

  const sqlCheck = `SELECT * FROM trails WHERE search_query=$1`;
  client.query(sqlCheck, [city])
    .then(result => {
      if (result.rowCount) {
        console.log('cached results used for trails');
        res.status(200).json(result.rows);
      } else {
        superagent.get(URL)
          .then(data => {
            let trailArr = data.body.trails.map(function (trail) {
              let newTrail = new Trail(trail);
              newTrail.search_query = city;
              return newTrail;
            });
            const sqlPlace = `INSERT INTO trails (search_query,name,location,length,stars,star_votes,sumarry,trail_url,conditions,condition_date,condition_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;
            trailArr.forEach(entry => {
              client.query(sqlPlace, [entry.search_query, entry.name, entry.location, entry.length, entry.stars, entry.star_votes, entry.summary, entry.trail_url, entry.conditions, entry.condition_date, entry.condition_time])
                .then(results => {
                  console.log('Successfull trail cache');
                });
            });
            res.status(200).json(trailArr);
          })
          .catch((error) => {
            console.log('error', error);
            res.status(500).send('Api call did not work');
          });
      }
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

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is now listening on ${PORT}`);
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });





