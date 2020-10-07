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
// fetch one scream
 exports.getScream = (req,res) => {
     let screamData = {};
     db.doc(`/screams/${req.params.screamId}`).get()
     .then(doc => {
         if(!doc.exists){
             return res.status(404).json({ error:'Scream not found' });
         }
         screamData = doc.data();
         screamData.screamId = doc.id;
         console.log(req.params.screamId);
         return db
         .collection('comments')
         .orderBy('createdAt','desc')
         .where('screamId', '==', req.params.screamId)
         .get();
     })
     .then(data => {
         screamData.comments = [];
         data.forEach(doc => {
             screamData.comments.push(doc.data());
         });
         return res.json(screamData);
     })
     .catch(err => {
         console.err(err);
         res.status(500).json({ error: err.code });
     });
 };

// ------------------------------------------------------------------------------------- comment on scream
 exports.commentOnScream =(req, res) => {
    if(req.body.body.trim() === ''){
        return res.status(400)
                  .json({ error: 'Body Must Not be Empty'});
    }

    const newComment =  {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        userImage: req.user.imageURL
    };

    db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({ error: 'Scream not found '});
        }
        return db.collection('comments').add(newComment);// add new doc to comments collection
    })
    .then(() => {
        res.json(newComment);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong'});
    })
 }