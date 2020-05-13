//requirements

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const express = require('express')
const app = express();
const PORT = 8080;

// app.usage

app.use(cookieParser())
app.use(morgan('dev'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// databases/objects

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
}

const urlDatabase = {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    'google': 'http://www.google.com',
};

// functions

const generateRandomString = () => {
    return Math.random().toString(36).replace('0.', '').substr(0, 6)
}


// routes

app.get('/', (req,res) => {
    res.send('Hello!')
})

app.get('/urls', (req, res) => {
    let templateVars = { urls: urlDatabase, username: users[req.cookies['user_id']]}
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    let templateVars = { username: users[req.cookies['user_id']] }
    res.render('urls_new', templateVars)
})

app.post("/urls", (req, res) => {
    const keyArray = Object.keys(req.body)
    const uniqueID = generateRandomString()
    for(let key of keyArray){
        urlDatabase[uniqueID] = req.body[key]
    }
    res.redirect(`/urls/${uniqueID}`)
})

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: users[req.cookies['user_id']]};
    res.render('urls_show', templateVars);
})

app.post('/urls/:shortURL/delete', (req, res) => {
    delete urlDatabase[req.params.shortURL]
    console.log(urlDatabase)
    res.redirect('/urls')
})

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n'); 
})

app.get("/u/:shortURL", (req, res) => {
    res.redirect(urlDatabase[req.params.shortURL])
  });

app.post('/urls/:id', (req, res) => {
    const responseKey = Object.keys(req.body)
    urlDatabase[responseKey[0]] = req.body[responseKey[0]]
    res.redirect('/urls')
 });

 app.post('/login', (req, res) => {
     res.cookie('username',req.body['cookieInput'])
     username = req.cookies['username']
     res.redirect('/urls')
 })

 app.post('/logout', (req, res) => {
     res.clearCookie('user_id')
     res.redirect('/urls')  
 })

 app.get('/register', (req, res) => {
     res.render('loginPage')
 })

 app.post('/register', (req, res) => {
     const { email, password } = req.body
     const id = generateRandomString()
     res.cookie('user_id', id )
     users[id] = { id, email, password }
     console.log(users)
     res.redirect('/urls')
 })

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})