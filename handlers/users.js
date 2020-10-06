const { admin, db } = require('../functions/admin');
const config = require('../utils/config');

const firebase = require ('firebase');
firebase.initializeApp(config);


const { validateSignupData, validateLoginData} = require('../utils/validators');
exports.signup = (req,res) => {
    const newUser = {
       email : req.body.email,
       password : req.body.password,
       confirmPassword : req.body.confirmPassword,
       handle : req.body.handle
    };
    //---------------------  Error Checking Section  ---------------------//
    const {valid, errors}  = validateSignupData(newUser);
    
    if(!valid) {
        return res.status(400).json(errors);
    }

    const noImg = 'no-img.PNG'
    //validate
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
          imageURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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
 }


 exports.login = (req, res) => {
    const user ={
       email: req.body.email,
       password: req.body.password
    }
    
    const {valid, errors}  = validateLoginData(user);
    
    if(!valid) {
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
 }

 exports.uploadImages = (req,res) => {
     const BusBoy = require('busboy');
     const path = require('path');
     const os = require('os');
     const fs = require('fs');

     const busboy = new BusBoy({ headers: req.headers });

     let imageFileName;
     let imageToBeUploaded = {};

     busboy.on('file',(fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname ,filename, mimetype);
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return res.status(400).json({ error: 'Wrong file type submitted'});
        }
        //my.image.png
         const imageExtension = filename.split(".")[filename.split(".").length - 1];
        // 654141865.png
        imageFileName = `${Math.round(Math.random()*1000000000)}.${imageExtension}`;
        const filePath =  path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = {filePath, mimetype}; 

        file.pipe(fs.createWriteStream(filePath));
     });

     busboy.on('finish', ()=>{
        
         admin.storage().bucket().upload(imageToBeUploaded.filePath,{
             resumable:false,
             metadata: {
                 contentType: imageToBeUploaded.mimetype
             }
         })
         .then(()=> {
             const imageURL =`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media` //use media cause if don't add this it will download to computer instead of show it
            return db.doc(`/users/${req.user.handle}`).update({ imageURL });
        })
        .then(() =>{
            return res.json({ message: 'Image Uploaded successfully'});
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code  });
        });
     });
     busboy.end(req.rawBody);
 }