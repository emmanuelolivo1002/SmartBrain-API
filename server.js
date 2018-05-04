const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

//Controllers
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');

// database connection
const db = knex({
  client: 'pg',
  connection: {
      host: '127.0.0.1',
      user: 'emmanuel',
      password: '',
      database: 'smart-brain'
  }
});

db.select('*').from('users');


const app = express();
app.use(bodyParser.json());
app.use(cors());



/*-----------------------         ROUTES       -------------------*/

app.get('/', (req, res) => {
  res.send(database.users);
});

app.post('/signin', (req, res) => {signin.handleSignin(req, res, bcrypt, db)});

app.post('/register', (req, res) => {register.handleRegister(req, res, bcrypt, db)});

app.get('/profile/:id', (req, res) => {profile.handleProfileGet(req, res, db)});

// Increase entries in profile
app.put('/image', (req, res) => {
  const {id} = req.body;
  db('users').where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    res.json(entries[0]);
  })
  .catch(err => res.json('Unable to get entries'));
});

app.listen(3000, () => {
  console.log('app running in port 3000');
});
