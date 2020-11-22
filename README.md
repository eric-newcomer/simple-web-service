# Simple Web Service
This simple web service validates that an image is a JPEG. If it is a JPEG, we will return the ZIP code the image was taken in.

![Main Demo](readme_img/main.gif)

## Implementation Overview
I implemented this web service using React on the frontend and Express on the backend. For managing changes in state on the frontend, I used React hooks, and to communicate/make REST API calls to my backend, I used Axios. In order to check the file type, I extracted the MIME type from the base64 string and checked whether it was a jpg or jpeg type. To convert from a base64 string back to an image file, I used [Node's file system module](https://nodejs.org/api/fs.html). To extract image/exif metadata from an image, I used the [node-exif](https://github.com/gomfunkel/node-exif) library, and to convert latitude and longitude coordinates to a ZIP code, I used Big Data Cloud's [Reverse Geocoding to City API](bigdatacloud.com/geocoding-apis/free-reverse-geocode-to-city-api).

## Project Setup
Run the following command in the backend/ and client/ directories to install all of the project dependencies.
```
npm install
```

## Running the app locally
To run the app locally, run ```node server.js``` from the backend/ directory and run ```npm start``` from the client/ directory.

In backend/
```
node server.js
```
In client/
```
npm start
```
To run the app with hot-reloading, make sure you have [nodemon](https://www.npmjs.com/package/nodemon) installed, then run ```nodemon server.js``` from the backend/ directory and run ```nodemon start``` from the client/ directory.

In backend/
```
nodemon server.js
```
In client/
```
nodemon start
```

## Docker
Install [Docker](https://www.docker.com/get-started) on your machine and run the following command from the root directory of this project

`docker-compose up`