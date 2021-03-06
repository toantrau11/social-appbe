const { db, admin } = require('../utils/admin');
const config = require('../utils/config');
const firebase = require('firebase');
const path = require('path');
// Initialize Firebase
firebase.initializeApp(config);

const {
  validateSignUpData,
  validateLoginData,
  reduceUserDetails
} = require('../utils/validations');

exports.getAuthenticatedUser = (req, res) => {
  let userData = {}; // credentials: {} and likes [{}, {}]

  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection('likes')
          .where('userHandle', '==', req.user.handle)
          .get();
      }
    })
    .then(data => {
      userData.like = [];
      data.forEach(doc => {
        userData.like.push(doc.data());
      });

      return res.json(userData);
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

// Add user detail
exports.addUserDetails = (req, res) => {
  const userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      res.json({ message: 'Details added successfully.' });
    })
    .catch(err => {
      console.log('error: ', err);
      res.status(500).json({ error: err.code });
    });
};
// Upload a profile image for user
exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    // if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
    //   return res.status(400).json({ error: 'Wrong file type submitted' });
    // }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    // 32756238461724837.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        // Append token to url
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: 'image uploaded successfully' });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: 'something went wrong' });
      });
  });
  busboy.end(req.rawBody);
};

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) return res.status(400).json(errors);

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

      const noImage = 'no-image.png';
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImage}?alt=media`,
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
      if (errorCode === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' });
      } else {
        return res.status(500).json({ error: error });
      }
    });
};

// Sign users up No EROR
// exports.signup = (req, res) => {
//   const newUser = {
//     email: req.body.email,
//     password: req.body.password,
//     confirmPassword: req.body.confirmPassword,
//     handle: req.body.handle,
//   };

//   const { valid, errors } = validateSignUpData(newUser);

//   if (!valid) return res.status(400).json(errors);

//   const noImg = "no-img.png";

//   let token, userId;
//   db.doc(`/users/${newUser.handle}`)
//     .get()
//     .then((doc) => {
//       if (doc.exists) {
//         return res.status(400).json({ handle: "this handle is already taken" });
//       } else {
//         return firebase
//           .auth()
//           .createUserWithEmailAndPassword(newUser.email, newUser.password);
//       }
//     })
//     .then((data) => {
//       userId = data.user.uid;
//       return data.user.getIdToken();
//     })
//     .then((idToken) => {
//       token = idToken;
//       const userCredentials = {
//         handle: newUser.handle,
//         email: newUser.email,
//         createdAt: new Date().toISOString(),
//         //TODO Append token to imageUrl. Work around just add token from image in storage.
//         imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
//         userId,
//       };
//       return db.doc(`/users/${newUser.handle}`).set(userCredentials);
//     })
//     .then(() => {
//       return res.status(201).json({ token });
//     })
//     .catch((err) => {
//       console.error(err);
//       if (err.code === "auth/email-already-in-use") {
//         return res.status(400).json({ email: "Email is already is use" });
//       } else {
//         return res
//           .status(500)
//           .json({ general: "Something went wrong, please try again" });
//       }
//     });
// };

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  // validate input data
  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      const errorCode = err.code;
      if (['auth/invalid-email', 'auth/wrong-password'].includes(errorCode)) {
        return res
          .status(403)
          .json({ general: 'Wrong credentials, please try again!.' });
      } else return res.status(500).json({ error: err.code });
    });
};
