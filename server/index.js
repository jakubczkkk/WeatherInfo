import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongodb from 'mongodb';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());

const PORT = 5000;

let db;
const db_url = 'mongodb+srv://user:user@cluster.9vk28.mongodb.net/db_weather?retryWrites=true&w=majority';
mongodb.MongoClient.connect(db_url, { useUnifiedTopology: true }, (err, client) => {
  if (err) return console.log(err)
  db = client.db('db_weather');
  console.log('Connect OK');
});

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));

app.get('/weather/', (req, res) => {
  db.collection('weather').find().toArray((err, result) => {
    if (err) return console.log(err);
    res.send(JSON.stringify(result));
  });
});

app.post('/weather/', (req, res) => { 
  db.collection('weather').insertOne(req.body, (err, result) => {
    if (err) return console.log(err);
    res.send({ message: 'Post weather'});
  });
});