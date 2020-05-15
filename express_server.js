// Requirements & Port

const { emailLookup, generateRandomString, loginChecker, urlsForUser } = require('./helpers');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const express = require('express');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;


// Express.JS Setup

app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['f77888e3-fad9-4e89-b8b7-1cff127f37aa', 'e6337385-acd1-43b5-aa6a-73090c8ce23f']
}));
app.use(methodOverride('_method'));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


// Database/Objects

const users = {};
const urlDatabase = {};


// Routes: '/', '/urls', '/urls/new'

app.get('/', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.status(403);
    let templateVars = {username: null, errorMessage: `User not logged in.` };
    res.render('errorPage', templateVars);
  } else {
    const userURLS = urlsForUser(req.session.user_id, urlDatabase);
    let templateVars = { urls: userURLS, username: users[req.session.user_id]};
    res.render('urls_index', templateVars);
  }
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  let templateVars = { username: users[req.session.user_id]};
  res.render('urls_new', templateVars);
});

app.post("/urls", (req, res) => {     // <- Create a new short url
  const keyArray = Object.keys(req.body);
  const uniqueID = generateRandomString();
  for (let key of keyArray) {
    urlDatabase[uniqueID] = { longURL: req.body[key], userID: req.session.user_id, totalViews: 0 };
  }
  res.redirect(`/urls/${uniqueID}`);
});

// Routes: '/urls/;id'


app.get('/urls/:id', (req, res) => {
  if (!urlDatabase[req.params.id]['longURL']) {     // <-- Verify longURL/Entry exists and is not an empty string
    res.status(403);
    let templateVars = {username: users[req.session.user_id], errorMessage: `URL not found.` };
    res.render('errorPage', templateVars);
  } else if (urlDatabase[req.params.id]['userID'] !== req.session.user_id) {   // <-- Verify cookie user
    res.status(403);
    let templateVars = {username: users[req.session.user_id], errorMessage: `You don't have access.` };
    res.render('errorPage', templateVars);
  } else {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]['longURL'], username: users[req.session.user_id]};
    res.render('urls_show', templateVars);
  }
});

app.delete('/urls/:id/delete', (req, res) => {    // <- Delete a short url
  if (urlDatabase[req.params.id]['userID'] === req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(403);
    let templateVars = { username: null, errorMessage: `You don't have access.` };
    res.render('errorPage', templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]['longURL']) {
    res.status(403);
    let templateVars = {username: users[req.session.user_id], errorMessage: `URL not found.` };
    res.render('errorPage', templateVars);
  } else {
    urlDatabase[req.params.id]['totalViews'] += 1;
    res.redirect(urlDatabase[req.params.id]['longURL']);
  }
});

app.put('/urls/:id', (req, res) => {   // <- Update/edit a short url
  const key = Object.keys(req.body);
  if (urlDatabase[key]['userID'] === req.session.user_id) {
    urlDatabase[key]['longURL'] = req.body[key];
    res.redirect('/urls');
  } else {
    res.status(403);
    let templateVars = { username: users[req.session.user_id], errorMessage: `You don't have access.` };
    res.render('errorPage', templateVars);
  }
});


//Routes: '/login', '/logout', '/register'

app.get('/login', (req, res) => {
  res.render('loginPage');
});

app.post('/login', (req, res,) => {
  const { email, password } = req.body;
  if (loginChecker(email, password, users) === 'NoEmail') {
    res.status(403);
    let templateVars = { username: null, errorMessage: `Email doesn't exist. Please register.` };
    res.render('errorPage', templateVars);
  } else if (loginChecker(email, password, users) === 'WrongP') {
    res.status(403);
    let templateVars = { username: null, errorMessage: `Password is incorrect. Please try again.` };
    res.render('errorPage', templateVars);
  } else {
    req.session.user_id = emailLookup(email, users);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('registrationPage');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.status(403);
    let templateVars = { username: null, errorMessage: `Email or password doesn't exist. Please try again.` };
    res.render('errorPage', templateVars);
  } else if (emailLookup(email, users)) {
    res.status(403);
    let templateVars = { username: null, errorMessage: `Email already exists. Please login.` };
    res.render('errorPage', templateVars);
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    req.session.user_id = id;
    users[id] = { id, email, hashedPassword };
    res.redirect('/urls');
  }
});



