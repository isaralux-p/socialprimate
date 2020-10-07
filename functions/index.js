
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
              if(doc.exist && (doc.data().userHandle !== snapshot.data().userHandle)){
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
          .catch(err => {
              console.error(err);
          });
}); 

//------------------------------------------------------------------------------------------------------------- Notification Unlike
exports.deleteNotificationOnUnLike = functions.firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        db.doc(`/notifications/${snapshot.id}`)
        .delete()
        .catch(err => {
            console.error(err);
        });
    });


//-------------------------------------------------------------------------------------------------------------- Notification comment
exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
      .onCreate((snapshot)=> {
          db.doc(`/screams/${snapshot.data().screamId}`)
          .get()
          .then(doc =>{
              if(doc.exists  && (doc.data().userHandle !== snapshot.data().userHandle)){
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

//----------------------------------------------------------------------------------------- changeUserImage

exports.onUserImageChange = functions.firestore.document('/users/{userId}')
      .onUpdate((change) => {
          console.log(change.before.data());
          console.log(change.after.data());
          let batch = db.batch();
          if(change.before.data().imageURL !== change.after.data().imageURL){
              console.log('image has change');
              return db.collection('screams').where('userHandle', '==', change.before.data().handle)
              .get()
              .then((data) => {
                  data.forEach(doc =>{
                      const scream = db.doc(`/screams/$doc.id`);
                      batch.update(scream, { userImage: change.after.data().imageURL});
                  });
                  return batch.commit();
              });
          }else{ return true; }
      });


//--------------------------------------------------------------------------------------------- delete Scream remove all comment like

exports.onScreamDelete = functions.firestore.document('/screams/{screamId}')
      .onDelete((snapshot, context) => {
          const screamId = context.params.screamId;
          const batch = db.batch();
          return db.collection('comments').where('screamId', '==', screamId)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        batch.delete(db.doc(`/comments/${doc.id}`));
                    });
                    return db.collection('likes').where('screamId', '==', screamId).get();
                })
                .then(data => {
                    data.forEach(doc => {
                        batch.delete(db.doc(`/likes/${doc.id}`));
                    });
                    return db.collection('notifications').where('screamId', '==', screamId).get();
                })
                .then(data => {
                    data.forEach(doc => {
                        batch.delete(db.doc(`/notifications/${doc.id}`));
                    });
                    return batch.commit();
                })
                .catch((err) => console.error(err));
      })