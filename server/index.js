const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();

function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authorizeUser() {
  
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());

const PORT = 5000;

const db_url = 'mongodb+srv://user:user@cluster.9vk28.mongodb.net/db_weather?retryWrites=true&w=majority';

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));

app.get('/weather/', (req, res) => {

  mongodb.MongoClient.connect(db_url, { useUnifiedTopology: true }, (err, client) => {

    if (err) return console.log(err)

      const db = client.db('db_weather');
      db.collection('weather').find().toArray((err, result) => {
        if (err) return console.log(err);
        res.send(JSON.stringify(result));
      });

  });

});

app.post('/weather/', (req, res) => {

  mongodb.MongoClient.connect(db_url, { useUnifiedTopology: true }, (err, client) => {

    if (err) return console.log(err);

      const db = client.db('db_weather');
      db.collection('weather').insertMany(req.body).catch(err => console.log(err));
      res.status(200).send();

  });

});

app.post('/register/', (req, res) => {

  mongodb.MongoClient.connect(db_url, { useUnifiedTopology: true }, async (err, client) => {

    if (err) return console.log(err)
    const db = client.db('db_users');
    db.collection('users').findOne({username: req.body.username})
    .then(async user => {
      if (user == null) {
        try {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          const user = {
            username: req.body.username,
            password: hashedPassword
          };
          db.collection('users').insertOne(user, (err, result) => {
            if (err) return console.log(err);
            res.status(200).send({message: "Poprawnie zarejestrowano użytkownika"});
          });
        } catch (error) {
          res.status(500).send(error);
        }
      } else {
        res.status(400).send({message: "Użytkownik o podanej nazwie jest już w zarejestrowany w bazie"});
      }
    });

  });
});

app.post('/login/', (req, res) => {

  mongodb.MongoClient.connect(db_url, { useUnifiedTopology: true }, (err, client) => {

    if (err) return console.log(err);
    const db = client.db('db_users');
    db.collection('users').findOne({username: req.body.username})
      .then(async user => {
        if (user == null) {
          return res.status(400).send({message: 'No such user'});
        }
        try {
          if (await bcrypt.compare(req.body.password, user.password)) {
            const token = generateAccessToken({ username: req.body.username} );
            res.status(200).send(JSON.stringify({token: token}));
          } else {
            res.status(400).send({message: 'Zły login lub hasło.'});
          }
        } catch {
          res.status(500).send();
        }
      })
      .catch(err => {
        console.log(err);
      });

  });

});
