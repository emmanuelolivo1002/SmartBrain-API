const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

//Controllers
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// database connection
const db = knex({
  client: 'pg',
  connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: true
  }
});

db.select('*').from('users');


const app = express();
app.use(bodyParser.json());
app.use(cors());



/*-----------------------         ROUTES       -------------------*/

app.get('/', (req, res) => {res.send(database.users);});

app.post('/signin', (req, res) => {signin.handleSignin(req, res, bcrypt, db)});

app.post('/register', (req, res) => {register.handleRegister(req, res, bcrypt, db)});

app.get('/profile/:id', (req, res) => {profile.handleProfileGet(req, res, db)});

app.put('/image', (req, res) => {image.handleImage(req, res, db)});

app.post('/imageurl', (req, res) => {image.handleAPICall(req, res)});

app.listen(process.env.PORT || 3000, () => {
  console.log(`app running in port ${process.env.PORT}`);
});
