DROP TABLE if exists locations;
DROP TABLE if exists weather;
DROP TABLE if exists trails;



CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  latitude FLOAT8,
  longitude FLOAT8,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255)
);

CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  forecast VARCHAR(255),
  time VARCHAR(255)
);

CREATE TABLE trails (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  name VARCHAR(255),
  location VARCHAR(255),
  latitude FLOAT8,
  longitude FLOAT8,
  length FLOAT4,
  stars FLOAT4,
  star_votes INT,
  sumarry VARCHAR(255),
  trail_url VARCHAR(255),
  conditions VARCHAR(255),
  condition_date DATE,
  condition_time TIME
);