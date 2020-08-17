let db = {
  screams: [
    {
      userHandle: 'user',
      body: 'this is a scream body',
      createdAt: '2020-08-11T16:19:03.939Z',
      likeCount: 5,
      commentCount: 2
    }
  ]
};

const userDetails = {
  credentials: {
    userId: '',
    email: '',
    handle: '',
    createdAt: '',
    imageUrl: '',
    bio: '',
    website: '',
    location: ''
  },
  likes: [
    {
      userHandle: '',
      screamId: ''
    },
    {
      userHandle: '',
      screamId: ''
    }
  ]
};
