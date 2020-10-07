let db = {
    users: [
        {
            userId: '0eClU6v8Qyfb0ESLDEhVZWwHEkg1',
            email: 'newer@email.com',
            handle: 'user',
            createdAt: '2020-10-06T09:18:11.250Z',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/mysocialprimate.appspot.com/o/663112942.PNG?alt=media',
            bio: 'Hello my name is USER, nice to meet you!',
            website: 'https://user.com',
            location: 'BKK, THAILAND'
        }
    ],

    screams: [
    {
        userHandle: 'user',
        body:'this is the scream body',
        createdAt:"2020-10-03T20:44:44.165Z",
        likeCount: 5,
        commentCount: 2
    }
    ]
}


const userDetails = {
    // Redux Data
    credentials: {
        userId: 'DFHU456SDF465FSD8675F',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2020-10-03T20:44:44.165Z',
        imageURL: 'image/asdasdasdasd/fdgfhgfh',
        bio: 'Hello my name is USER, nice to meet you!',
        website: 'https://user.com',
        location: 'BKK, THAILAND'
    },
    likes: [
        {
            userHandle: 'user',
            screamId: 'JKGHsadashd',
        },
        {
            userHandle: 'user',
            screamId: 'adashdKJahf',
        }

    ]
};