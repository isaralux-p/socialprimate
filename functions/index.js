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


//-------------------------- Function define section --------------------------//
const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isEmpty = email => (email.trim() === '' ?  true : false);
const isEmail = email => (email.match(emailRegEx)? true: false);



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
const FireAuth = (req, res, next) => {
   let idToken;
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){ // check header is right
      idToken = req.headers.authorization.split('Bearer ')[1]; // get data after header
   }
   else {
      console.error('No Token Found');
      return res.status(403).json({error: 'Unauthorized'});
   }

      admin.auth().verifyIdToken(idToken)
      .then(decodedToken => {          //get data from collection which matched with decodedToken
         req.user = decodedToken;
         console.log(decodedToken);
         return db.collection('users')
         .where('userId','==', req.user.uid)
         .limit(1)
         .get();
      })
      .then(data => {
         req.user.handle = data.docs[0].data().handle; //extract data which is handle in array
         return next();  // allow request -> app.post/scream
      })
      .catch(err => {
         console.error('Error while verifying token ', err);
         return res.status(403).json(err);
      })
}


app.post('/scream', FireAuth, (req,res) =>{

   if(req.body.body.trim()=== ''){
      return res.status(400).json({ body: 'Body must not be empty' });
   }

   const newScream = {
      body: req.body.body,
      userHandle: req.user.handle,
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

//---------------------  Error Checking Section  ---------------------//
let errors = {};

if(isEmpty(newUser.email)){
   errors.email = " Must not be Empty";
}
else if(!isEmail(newUser.email)){
   errors.email = " Must be a valid email address";
}
if(isEmpty(newUser.password)){
   errors.password = " Must not be Empty"
}
if(newUser.password !== newUser.confirmPassword){
   errors.confirmPassword =" Password must match"
}
if( isEmpty(newUser.handle)){
   errors.handle = " Must not be empty";
}

if(Object.keys(errors).length > 0){
   return res.status(400).json(errors);
}

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


//---------------------  Login Section  ---------------------//
app.post('/login',(req, res) => {
   const user ={
      email: req.body.email,
      password: req.body.password
   }

   let errors = {}

   if(isEmpty(user.email)){
      error.email = "Email must be empty!";
   }
   if(isEmpty(user.password)){
      errors.password ="Password Must not be empty!";
   }
   if(Object.keys(errors).length > 0){
      return res.status(400).json(errors);
   }

   firebase
   .auth()
   .signInWithEmailAndPassword(user.email, user.password)
   .then(data => {
      return data.user.getIdToken();
   })
   .then(token => {
      return res.json({ token });
   })
   .catch(err => {
      console.error(err);
      if(err.code === "auth/wrong-password") {
         return res
         .status(403)
         .json({ general: " Wrong Credentials, Please try again "});
      }
      else {
         return res
         .status(500)
         .json({error: err.code});
      }
   });
})


exports.api = functions.https.onRequest(app);