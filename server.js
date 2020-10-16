'use strict';

//Dependenceis
const express = require('express');
const cors = require('cors');

require('dotenv').config();

// Server listening port

const PORT = process.env.PORT || 8080;

// Start express

const app = express();

// use Cors

app.use(cors());

//Start Server


//Routes

app.get('/', (request, response) => {
  response.send('Default');
});

app.get('/bad', (request,response) => {
  throw new Error('Wrong');
});

app.get('/location', (request, response) => {
  try {
    let data = require('./data/location.json')[0];
    let city = request.query.city;
    let location = new Location(data, city);
    console.log(location);
    response.send(location);
  }
  catch (error) {
    console.log('Error', error);
    response.status(500).send('So sorry, something went wrong.');
  }
});

app.get('/weather', (request, response) => {
  try {
    let data = require('./data/weather.json');
    let weatherArr = [];
    data.data.forEach(day => {
      let weather = new Weather(day);
      weatherArr.push(weather);
    });
    response.send(weatherArr);
  }
  catch (error) {
    console.log('Error', error);
    response.status(500).send('So sorry,something went wrong');
  }
});

// Constructors

function Location(obj, query) {
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = query;
  this.formatted_query = obj.display_name;
}

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;

}


//Starting Server
app.listen(PORT, () => {
  console.log(`server is now listening on ${PORT}`);
});



