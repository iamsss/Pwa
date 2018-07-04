const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');
const app = express();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const corsOptions = {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
};

app.use(cors({ origin: true }));
// Add headers


app.post('/', (request, response) => {
  const corsMiddleware = cors(corsOptions);
  corsMiddleware(req, res, () => {
    admin.database().ref('posts').push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image
    }).then(() => {
       return response.status(200).send('Success');
    }).catch((err) => {
        console.log(err);
    });
  });
});




exports.storePostData = functions.https.onRequest(app);
