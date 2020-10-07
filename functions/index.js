
//-------------------------- initial section --------------------------//
const functions = require('firebase-functions');
const app = require('express')();

const FireAuth = require('../utils/fireAuth');
const { db } = require('../utils/admin')

const { getAllScreams,
        postOneScream,
        getScream,
        commentOnScream,
        likeScream,
        unlikeScream,
        deleteScream 
        } = require('../handlers/screams');
const { signup,
        login, 
        uploadImages, 
        addUserDetails,
        getAuthenticatedUser
      } = require('../handlers/users');
const { firestore } = require('firebase-admin');

//screams route
app.get('/screams', getAllScreams);
app.get('/scream/:screamId', getScream);
app.post('/scream', FireAuth, postOneScream);
app.post('/scream/:screamId/comment', FireAuth, commentOnScream);
app.get('/scream/:screamId/like', FireAuth, likeScream);
app.get('/scream/:screamId/unlike', FireAuth, unlikeScream);
app.delete('/scream/:screamId', FireAuth, deleteScream);

//user Route
app.post ('/signup',signup);
app.post('/login',login);
app.post('/user', FireAuth, addUserDetails);
app.post('/user/image', FireAuth, uploadImages);
app.get('/user', FireAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
/*
exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
      .onCreate((snapshot)=> {
          db.doc(`/screams/${snapshot.data().screamId}`)
          .get()
          .then(doc =>{
              if(doc.exists){
                  return db.doc(`/notifications/${snapshot}`)
              }
          })

      })

      */