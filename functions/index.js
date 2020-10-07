
//-------------------------- initial section --------------------------//
const functions = require('firebase-functions');
const app = require('express')();

const FireAuth = require('./fireAuth');
const { db } = require('./admin');

const { getAllScreams,
        postOneScream,
        getScream,
        commentOnScream,
        likeScream,
        unlikeScream,
        deleteScream 
        } = require('./screams');
const { signup,
        login, 
        uploadImages, 
        addUserDetails,
        getAuthenticatedUser,
        getUserDetails,
        markNotificationsRead
      } = require('./users');
const { firestore } = require('firebase-admin');
const fireAuth = require('./fireAuth');

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
app.get('/user/:handle', getUserDetails);
app.post('/notifications', fireAuth, markNotificationsRead);


exports.api = functions.https.onRequest(app);
//------------------------------------------------------------------------------------------------------------- Notification Like
exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
      .onCreate((snapshot)=> {
          db.doc(`/screams/${snapshot.data().screamId}`)
          .get()
          .then(doc =>{
              if(doc.exists){
                  return db.doc(`/notifications/${snapshot.id}`).set({
                      createdAt: new Date().toISOString(),
                      recipient: doc.data().userHandle,
                      sender: snapshot.data().userHandle,
                      type: 'like',
                      read: false, 
                      screamId: doc.id
                  })
              }
          })
          .then(() => {
              return;
          })
          .catch(err => {
              console.error(err);
              return;
          });
}); 

//------------------------------------------------------------------------------------------------------------- Notification Unlike
exports.deleteNotificationOnUnLike = functions.firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        db.doc(`/notifications/${snapshot.id}`)
        .delete()
        .then(() => {
            return;
        })
        .catch(err => {
            console.error(err);
            return;
        });
    });


//-------------------------------------------------------------------------------------------------------------- Notification comment
exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
      .onCreate((snapshot)=> {
          db.doc(`/screams/${snapshot.data().screamId}`)
          .get()
          .then(doc =>{
              if(doc.exists){
                  return db.doc(`/notifications/${snapshot.id}`).set({
                      createdAt: new Date().toISOString(),
                      recipient: doc.data().userHandle,
                      sender: snapshot.data().userHandle,
                      type: 'comment',
                      read: false, 
                      screamId: doc.id
                  })
              }
          })
          .then(() => {
              return;
          })
          .catch(err => {
              console.error(err);
              return;
          });
      });     