const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

// Knex Setup
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);

let bcrypt = require('bcrypt');
const saltRounds = 10;

let overMessages = [
  "You are over budget. Stop spending money.",
  "Seriously, stop.",
  "Have you no self-control??",
  "Stop. Just stop.",
  "Think of the children!"
];
let messageIndex = 0;
let categories = [
  "Food",
  "Clothes",
  "Rent",
  "Utilities",
  "Entertainment",
  "Other"
];

// Register new user
app.post('/api/users', (req, res) => {
  if (!req.body.password || !req.body.username)
    return res.status(400).send();
    // first gets only the first entry
  knex('user').where('username',req.body.username).first().then(user => {
    if (user !== undefined) {
      res.status(403).send('Username already exists');
      throw new Error('abort');
    }
    return bcrypt.hash(req.body.password, saltRounds);
  }).then(hash => {
    return knex('user').insert({
      username: req.body.username,
      password: hash,
    });
  }).then(ids => {
    return knex('user').where('id',ids[0]).first();
  }).then(user => {
    res.status(200).json({user:user});
    return;
  }).catch(error => {
    console.log(error);
    if (error.message !== 'abort') {
      res.status(500).json({ error });
    }
  });
});

app.post('/api/login', (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.status(400).send();
  knex('user').where('username',req.body.username).first().then(user => {
    if (user === undefined) {
      // User not found in database
      res.status(403).send("Invalid credentials");
      throw new Error('abort');
    }
    return [bcrypt.compare(req.body.password, user.password),user];
  }).spread((result,user) => {
    if (result)
      res.status(200).json({user:user});
    else
      res.status(403).send("Invalid credentials");
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

app.post('/api/budget', (req, res) => {
  if (!req.body.id || !req.body.month || !req.body.amount)
    return res.status(400).send();
    knex('user').where('id',req.body.id).first().then(user => {
      return knex('budget').insert({user_id: req.body.id, amount: req.body.amount, month: req.body.month});
    }).then(ids => {
      return knex('budget').where('id',ids[0]).first();
    }).then(budget => {
      res.status(200).json({budget:budget});
      return;
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

app.get('/api/budget/:id/:month', (req, res) => {
  let id = parseInt(req.params.id);
  let month = req.params.month;
  knex('budget')
    .where('budget.user_id', id)
    .where('budget.month', month)
    .select('amount','month').first().then(budget => {
      res.status(200).json({budget:budget});
    }).catch(error => {
      res.status(500).json({ error });
    });
});

app.get('/api/items/:id/:month', (req, res) => {
  let id = parseInt(req.params.id);
  let month = req.params.month;
  knex('expenses')
    .where({'user_id': id, 'month': month})
    .select('id','description','amount','category','date', 'month').then(expenses => {
      res.status(200).json({expenses:expenses});
    }).catch(error => {
      res.status(500).json({ error });
    });
});

app.post('/api/items', (req, res) => {
  knex('expenses').insert({
    user_id: req.body.user_id,
    amount: req.body.amount,
    description: req.body.description,
    category: req.body.category,
    date: req.body.date,
    month: req.body.month,
  }).then(ids => {
    return knex('expenses').where('id', ids[0]).first();
  }).then(expense => {
    res.status(200).json({expense:expense})
  }).catch(error => {
    console.log(error);
    res.status(500).json({error});
  })
});

app.get('/api/message', (req, res) => {
  let message = overMessages[messageIndex];
  messageIndex++;

  if (messageIndex > overMessages.length) {
    messageIndex = 0;
  }

  res.send(message);
});

app.get('/api/categories', (req, res) => {
  res.send(categories);
});

app.delete('/api/items/:id', (req, res) => {
  let id = parseInt(req.params.id);
  knex('expenses').where('id',id).first().del().then(ids => {
    res.sendStatus(200);
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});

app.delete('/api/items/:id', (req, res) => {
  let id = parseInt(req.params.id);
  knex('expenses').where('id',id).first().del().then(ids => {
    res.sendStatus(200);
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});

app.listen(3000, () => console.log('Server listening on port 3000'));
