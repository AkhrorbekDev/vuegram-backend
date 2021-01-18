const express = require('express');
const bodyParser = require('body-parser');
const CORS = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const serviceAccount = require('./firebase.conf.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'vuegram-98cd7.appspot.com',
});

const user = require('./src/routes/user');
const post = require('./src/routes/post');

app.use(CORS());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/api/users', user);
app.use('/api/posts', post);


if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/spa'));
}
app.use(express.static(path.join(__dirname, 'client/spa')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/spa/index.html'));
});

module.exports = app; 