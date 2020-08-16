const admin = require('firebase-admin');
var serviceAccount = require('../key/admin.json');

admin.initializeApp({
  credential: admin.credential.applicationDefault(serviceAccount),
  databaseURL: 'https://social-app-b7a06.firebaseio.com',
  storageBucket: 'social-app-b7a06.appspot.com'
});
const db = admin.firestore();

module.exports = { admin, db };
