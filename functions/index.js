
//-------------------------- initial section --------------------------//
const functions = require('firebase-functions');
const app = require('express')();

const FireAuth = require('../utils/fireAuth');

const { getAllScreams, postOneScream } = require('../handlers/screams');
const { signup,
        login, 
        uploadImages, 
        addUserDetails,
        getAuthenticatedUser
      } = require('../handlers/users');

//screams route
app.get('/screams', getAllScreams);
app.post('/scream', FireAuth, postOneScream);

//user Route
app.post ('/signup',signup);
app.post('/login',login);
app.post('/user', FireAuth, addUserDetails);
app.post('/user/image', FireAuth, uploadImages);
app.get('/user', FireAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);