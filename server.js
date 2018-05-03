const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

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


// Test database
const database = {
  users : [
    {
      id: '123',
      name: 'Emmanuel',
      email: 'emm@test.com',
      password: 'pass',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'Ainhoa',
      email: 'ainhoa@test.com',
      password: 'pass',
      entries: 0,
      joined: new Date()
    },
  ]
}

/*-----------------------         ROUTES       -------------------*/

app.get('/', (req, res) => {
  res.send(database.users);
});

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => res.status(400).json('Unable to get user'));
      } else {
        res.status(400).json('Wrong credentials');
      }
    })
    .catch(err => res.status(400).json('Wrong credentials'));
});

app.post('/register', (req, res) => {
  const {name, email, password} = req.body;

  const hash = bcrypt.hashSync(password);

  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
      .returning('*')
      .insert({
        name: name,
        email: loginEmail[0],
        joined: new Date()
      })
      .then(user => {
        res.json(user[0]);
      })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => res.status(400).json('Unable to register'));



});

app.get('/profile/:id', (req, res) => {
  const {id} = req.params;
  db.select('*').from('users').where({id})
  .then( user => {
    if (user.length) {
      res.json(user[0]);
    } else {
      res.status(400).json('User not found!');
    }
  })
  .catch(err => res.status(400).json('Error getting user'));
});

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
