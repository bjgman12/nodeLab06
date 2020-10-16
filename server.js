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

app.get('/location', (request,response) => {
  let city = request.query.city;
  let data = require('data/location.json')[0];
  let location = new Location(data,city);
  response.send(location);
});


// Constructors

function Location(obj,query){
  this.lat = obj.lat;
  this.lon = obj.lon;
  this.search_query = query;
  this.location = obj.display.name;
}

app.listen(PORT, () => {
  console.log(`server is now listening on ${PORT}`);
});



