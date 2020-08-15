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
var serviceAccount = require('./key/admin.json');

admin.initializeApp({
  credential: admin.credential.applicationDefault(serviceAccount),
  databaseURL: 'https://social-app-b7a06.firebaseio.com'
});
const db = admin.firestore();

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// get screams
app.get('/screams', (req, res) => {
  db.collection('screams')
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

  db.collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully.` });
    })
    .catch(error => {
      res.status(500).json({ error: 'Something went wrong!' });
      console.error(error);
    });
});

app.post('/signup', async (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let token, userId;
  // Validate data
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ handle: 'this handle is already taken.' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(error => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' });
      } else {
        return res.status(500).json({ error: error });
      }
    });
});

exports.api = functions.https.onRequest(app);
