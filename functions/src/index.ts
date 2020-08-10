import * as express from 'express';
import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const firebaseConfig = {
  apiKey: 'AIzaSyCCh9O58kvco0Xphh6XW4Tjs_SMNutwpvs',
  authDomain: 'social-app-b7a06.firebaseapp.com',
  databaseURL: 'https://social-app-b7a06.firebaseio.com',
  projectId: 'social-app-b7a06',
  storageBucket: 'social-app-b7a06.appspot.com',
  messagingSenderId: '562804129364',
  appId: '1:562804129364:web:4c44e4279249d63ab877c1'
};

admin.initializeApp();
firebase.initializeApp(firebaseConfig);
const app = express();

const db = admin.firestore();
/**
 * Get screams
 */
app.get('/screams', (req, res) => {
  db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams: any[] = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle
        });
      });

      return res.json(screams);
    })
    .catch(error => console.error(error));
});

/**
 * Create a scream
 */
app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    userHandle: req.body.userHandle
  };

  db.collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({ message: `Document ${doc.id} created successfully.` });
    })
    .catch(err => {
      res.status(500).json({ error: 'Some thing went wrong.!' });
      console.error(err);
    });
});

// Signup route
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
    .then((data: firebase.auth.UserCredential) => {
      const uid = data.user ? data.user.uid : null;
      return res.status(201).json({ message: `User ${uid}` });
    })
    .catch(error => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error----', error);

      console.log('errorCode - errorMessage', errorCode, errorMessage);
      return res.status(500).json({
        error: error.code
      });
    });
});

exports.api = functions.https.onRequest(app);
