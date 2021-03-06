const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const PORT = 8000;

app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(express.static('public'));

/**** SETUP DB CONNECTION ****/
const knex = require('./db.js');

/*
  GET ALL Travellers
*/
app.get('/travel', (req, res) => {
  knex('travel').then((rows) => {
    res.format({
      'application/json': () => res.json(rows),
      'text/html': () => res.render('travel/index', { travel: rows }),
      'default': () => res.sendStatus(406)
    });
  });
});

/*
FETCH A NEW FORM
*/
app.get('/travel/new', (req, res) => {
  res.render('travel/new');
});

/*
  CREATE A Traveller
*/
app.post('/travel', (req, res) => {
  const { title, description } = req.body;

  const newTraveler = {
    title,
    description
  };

  knex('travel')
    .insert(newTraveler) // INSERTS A NEW Traveller
    .returning('*')
    .then((rows) => {
      const travel = rows[0];

      res.format({
        'application/json': () => res.json(travel),
        'text/html': () => res.redirect('/travel/' + travel.id),
        'default': () => res.sendStatus(406)
      })
    }).catch({
      res.format({    //getting errors here
        'application/json': () => res.sendStatus(400),
        'text/html': () => res.redirect('/travel/new')
      })
    })
});

/*
  FETCH A person
*/
app.get('/travel/:person_id', (req, res) => {
  const personId = req.params.person_id;

  knex('travel')
  .where('id', personId) // look for  a person
  .then((rows) => {
    const foundPerson = rows[0];

    res.format({
     'application/json': () => res.json(foundPerson),
     'text/html': () => res.render('/travel/show', { travel: foundPerson }), //questionable!
     'default': () => res.sendStatus(406)
    })
  })
  .catch(() => {

    res.sendStatus(404);
  });
});

/*
  PATCH A PERSON
*/
app.patch('/travel/:person_id', (req, res) => {
  const personId = req.params.person_id;
  const { title, description } = req.body;

  knex('travel')
    .where('id', personId)
    .returning('*')
    .update({ title, description })
    .then((rows) => {
      const person = rows[0];

      res.json(person);
    })
    .catch(() => {
      res.sendStatus(400);
    })
});

/*
  DELETE A PERSON
*/
app.delete('/travel/:person_id', (req, res) => {
  knex('travel')
    .where('id', req.params.person_id)
    .del()
    .then(() => res.sendStatus(204));
});

app.listen(PORT, () => console.log('Listening on', PORT))
