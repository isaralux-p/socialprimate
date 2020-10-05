const  admin  = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();


//--------------------- config to firebase project ---------------------//
const config = {
   apiKey: "AIzaSyC_AQJXt4xr1ckcZPPzDDt45R-Yxmg5yGE",
   authDomain: "mysocialprimate.firebaseapp.com",
   databaseURL: "https://mysocialprimate.firebaseio.com",
   projectId: "mysocialprimate",
   storageBucket: "mysocialprimate.appspot.com",
   messagingSenderId: "828121670867",
   appId: "1:828121670867:web:05b5ee8919023bc17c2026",
   measurementId: "G-MT03S1LQKD"
 };

//-------------------------- initial section --------------------------//
const app = require('express')();
const firebase = require('firebase');
const db = admin.firestore();

firebase.initializeApp(config);


// get collection route
app.get('/screams', (req,res) => {
   db
   .collection('screams')
   .orderBy('createdAt', 'desc')
   .get()
   .then((data) => {
      let screams = [];
      data.forEach((element) => {
         screams.push({
            screamId: element.id,
            body: element.data().body,
            userHandle: element.data().userHandle,
            createdAt: element.data().createdAt
         });
      });
      return res.json(screams);
   })
   .catch(err => console.error(err));
});

//---------------------  add collection route  ---------------------//
app.post('/scream',(req,res) =>{

   const newScream = {
      body: req.body.body,
      userHandle: req.body.userHandle,
      createdAt: new Date().toISOString()
   };

      db
      .collection('screams')
      .add(newScream)
      .then(doc => {
         res.json({ message: `document ${doc.id} created successfully`})   
      })
      .catch(err => {
         res.status(500).json({error:'something went wrong'});
         console.error(err);
      })
})

//---------------------  Signup Route  ---------------------//

app.post ('/signup', (req,res) => {
   const newUser = {
      email : req.body.email,
      password : req.body.password,
      confirmPassword : req.body.confirmPassword,
      handle : req.body.handle
   };


   //---------------------  Validated Section  ---------------------//

   let tokenId,userId;
   db.doc(`/users/${newUser.handle}`)
   .get()
   .then(doc => {
      if(doc.exists){
         return res.status(400).json({ handle: 'this handle is already taken'});
      }
      else {
         return firebase
         .auth()
         .createUserWithEmailAndPassword(newUser.email, newUser.password)   
      }
   })
   .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
   })
   .then(token => {
      tokenId = token
      const userCredentials = {
         handle: newUser.handle,
         email: newUser.email,
         createdAt: new Date().toISOString(),
         userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials); 
   })
   .then (() =>{
      return res.status(201).json({ tokenId });
   })
   .catch (err => {
      if(err.code === "auth/email-already-in-use"){
         return res.status(400).json({ email: 'Email is already taken!'});
      }
      else {
         console.error(err);
         return res.status(500).json({ error: err.code });
      }    
   })
});

exports.api = functions.https.onRequest(app);