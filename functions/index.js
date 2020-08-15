const functions = require('firebase-functions');
app = require('express')();

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login } = require('./handlers/users');
const FBAuth = require('./utils/fbAuth');
// get screams
app.get('/screams', getAllScreams);

// Post a scream
app.post('/scream', FBAuth, postOneScream);

// Signup route
app.post('/signup', signup);

// Login route
app.post('/login', login);

exports.api = functions.https.onRequest(app);
