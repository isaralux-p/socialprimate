
//-------------------------- initial section --------------------------//
const functions = require('firebase-functions');
const app = require('express')();

const FireAuth = require('../utils/fireAuth');

const { getAllScreams,
        postOneScream,
        getScream,
        commentOnScream } = require('../handlers/screams');
const { signup,
        login, 
        uploadImages, 
        addUserDetails,
        getAuthenticatedUser
      } = require('../handlers/users');

//screams route
app.get('/screams', getAllScreams);
app.get('/scream/:screamId', getScream);
app.post('/scream', FireAuth, postOneScream);
app.post('/scream/:screamId/comment', FireAuth, commentOnScream);
// Todo: delete scream
// Todo: like scream
// Todo: unlike scream
// Todo: comment scream

//user Route
app.post ('/signup',signup);
app.post('/login',login);
app.post('/user', FireAuth, addUserDetails);
app.post('/user/image', FireAuth, uploadImages);
app.get('/user', FireAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);