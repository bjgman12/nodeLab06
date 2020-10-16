'use strict';

//Dependenceis
const express = require('express');
const cors = require('cors');

require('dotenv').config();

// Server listening port

const PORT = process.env.PORT || 3000;

// Start express

const app = express();

// use Cors

app.use(cors());

//Start Server

app.listen(PORT, () => {
  console.log(`server is now listening on ${PORT}`);
});

