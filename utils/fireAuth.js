 const { admin, db }  = require('../functions/admin');

module.exports = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){ // check header is right
       idToken = req.headers.authorization.split('Bearer ')[1]; // get data after header
    }
    else {
       console.error('No Token Found');
       return res.status(403).json({error: 'Unauthorized'});
    }
 
       admin
       .auth()
       .verifyIdToken(idToken)
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
          req.user.imageURL = data.docs[0].data().imageURL;
          return next();  // allow request -> app.post/scream
       })
       .catch(err => {
          console.error('Error while verifying token ', err);
          return res.status(403).json(err);
       })
 }