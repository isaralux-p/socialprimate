const { db } = require('../functions/admin');

exports.getAllScreams = (req,res) => {
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
             createdAt: element.data().createdAt,
             commentCount: element.data().commentCount,
             likeCount: element.data().likeCount
          });
       });
       return res.json(screams);
    })
    .catch(err => {
       console.error(err)
       res.status(500).json({ error:err.code });
    });
}


exports.postOneScream = (req,res) =>{

    if(req.body.body.trim() === ''){
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
 }