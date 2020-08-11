const functions = require('firebase-functions');
const admin = require('firebase-admin');
app = require('express')();

const firebaseConfig = {
  apiKey: 'AIzaSyCCh9O58kvco0Xphh6XW4Tjs_SMNutwpvs',
  authDomain: 'social-app-b7a06.firebaseapp.com',
  databaseURL: 'https://social-app-b7a06.firebaseio.com',
  projectId: 'social-app-b7a06',
  storageBucket: 'social-app-b7a06.appspot.com',
  messagingSenderId: '562804129364',
  appId: '1:562804129364:web:4c44e4279249d63ab877c1'
};
const firebase = require('firebase');

admin.initializeApp();

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// get screams
app.get('/screams', (req, res) => {
  admin
    .firestore()
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });

      return res.json(screams);
    })
    .catch(err => {
      console.error(err);
    });
});

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: res.body.userHandle,
    createdAt: new Date().toISOString()
  };

  admin
    .firestore()
    .collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully.` });
    })
    .catch(error => {
      res.status(500).json({ error: 'Something went wrong!' });
      console.error(error);
    });
});

app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res.status(201).json({ message: `user ${data.user.uid} signed.` });
    })
    .catch(error => {
      console.error(error);
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      return res.status(500).json({ error: error.code });
    });
});
exports.api = functions.https.onRequest(app);
