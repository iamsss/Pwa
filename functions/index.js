const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');
const app = express();
var webpush = require('web-push');
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
      webpush.setVapidDetails('mailto:saurav@gmail.com',
    'BNqgW3udtCpfYFYS2BGmOrawCpik8jZWYxp0ZKM7JZ25Dijdsbo4r51y7mQqOOo6jvzRCHnIK54TnPcKxnvoiAQ',
  'HIJg0AdhJWTLhjnQlx1Sbop8SOD-DH0muw_7DYW3EjM'
);
       return admin.database.ref('subscriptions').once('value');
    }).then((subscriptions) => {
    return  subscriptions.forEach((sub) => {
        const pushConfig = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh
          }

        };
        webpush.sendNotification(pushConfig, JSON.stringify({ title: 'New Post', content: 'New Post Added'}))
        
      })
    }).catch((err) => {
        console.log(err);
    });
  });
});




exports.storePostData = functions.https.onRequest(app);
