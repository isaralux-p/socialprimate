
//-------------------------- initial section --------------------------//
const functions = require('firebase-functions');
const app = require('express')();

const FireAuth = require('../utils/fireAuth');

const { getAllScreams, postOneScream } = require('../handlers/screams');
const { signup, login} = require('../handlers/users');

// get screams route
app.get('/screams', getAllScreams);
app.post('/scream', FireAuth, postOneScream);

//user Route
app.post ('/signup',signup);
app.post('/login',login);

exports.api = functions.https.onRequest(app);