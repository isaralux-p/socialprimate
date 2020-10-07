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
       userImage: req.user.imageURL,
       createdAt: new Date().toISOString(),
       likeCount: 0,
       commentCount: 0
    };
 
       db
       .collection('screams')
       .add(newScream)
       .then(doc => {
          const resSCream = newScream;
          resSCream.screamId = doc.id;
          res.json(resSCream)   
       })
       .catch(err => {
          res.status(500).json({error:'something went wrong'});
          console.error(err);
       })
 }
//------------------------------------------------------------------------------------------------------------------ fetch one scream
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
        return doc.ref.update({commentCount: doc.data().commentCount + 1});
    })
    .then(() => {
        return db.collection('comments').add(newComment);
    })
    .then(() => {
        res.json(newComment);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong'});
    })
 }

 //------------------------------------------------------------------------------------------------------ like the scream

 exports.likeScream = (req, res) => {
     const likeDoc = db
        .collection('likes')
        .where('userHandle','==',req.user.handle)
        .where('screamId', '==', req.params.screamId)
        .limit(1);   // you can like only 1 time

    const screamDoc = db
        .doc(`/screams/${req.params.screamId}`);

    let screamData;

    screamDoc
    .get()
    .then(doc => {
        if(doc.exists){
            screamData = doc.data();
            screamData.screamId = doc.id;
            return likeDoc.get();
        }
        else {
            return res.status(404).json({ error: 'Scream not found'});
        }
    })
    .then(data => {              
        if(data.empty){     // if didn't has like so create a new one
            return db.collection('likes').add({
                screamId: req.params.screamId,
                userHandle: req.user.handle
            })
            .then(() => { // have to nested promise if not empty here cause  
                screamData.likeCount++
                return screamDoc.update({ likeCount: screamData.likeCount })
            })
            .then(() => {
                return res.json(screamData);
            })
        }
        else {
            return res.status(400).json({ error:'scream already liked'});
        }
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({ error: err.code});
    });
 }

//--------------------------------------------------------------------------------------------------------  unliked scream

exports.unlikeScream = (req, res) => {
    const likeDoc = db
       .collection('likes')
       .where('userHandle','==',req.user.handle)
       .where('screamId', '==', req.params.screamId).limit(1);

   const screamDoc = db
       .doc(`/screams/${req.params.screamId}`);

   let screamData;

   screamDoc
   .get()
   .then(doc => {
       if(doc.exists){
           screamData = doc.data();
           screamData.screamId = doc.id;
           return likeDoc.get();
       }
       else {
           return res.status(404).json({ error: err.code});
       }
   })
   .then(data => {              
       if(data.empty){ 
           return res.status(400).json({ error:'scream not liked'});    
       }
       else {
           console.log(data.docs[0].id);
            return db.doc(`/likes/${data.docs[0].id}`)
            .delete()
            .then(() => {
                screamData.likeCount--;
                return screamDoc.update({ likeCount: screamData.likeCount});
            })
            .then(() =>{
                res.json(screamData);
            })
       }
   })
   .catch(err => {
       console.error(err)
       res.status(500).json({ error: err.code});
   });
}

//----------------------------------------------------------------------------------------------------------------  delete Scream

exports.deleteScream = (req, res) => {
    const document = db.doc(`/screams/${req.params.screamId}`);
    document.get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Scream not found'});
            }
            if(doc.data().userHandle !== req.user.handle){ // didn't matched User
                return res.status(403).json({error: 'Unauthorized delete'});
            }else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Scream deleted successfully'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code});
        });
};