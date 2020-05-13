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
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
  };

// functions

const generateRandomString = () => {
    return Math.random().toString(36).replace('0.', '').substr(0, 6)
}

const emailLookup = (email, database) => {
    for (let userAccount in database) {
        if (database[userAccount]['email'] === email) {
            return userAccount
        }
    }
}

const loginChecker = (email, password) => {
    if (emailLookup(email, users)) {
        let userAccount = emailLookup(email, users)
        if(users[userAccount]['password'] === password) {
            return true
        } else {
            return 'WrongP'
        }
    } else if (!emailLookup(email, users)) {
        return 'NoEmail'
    }
}

const urlsForUser = (id, database) => {
    const newObject = {}
    for (let key in database) {
        if (id === database[key]['userID']) {
            newObject[key] = database[key]
        }
    }
    return newObject
}

// routes

app.get('/', (req,res) => {
    res.send('Hello!')
})

app.get('/urls', (req, res) => {
    const userURLS = urlsForUser(req.cookies['user_id'], urlDatabase)
    console.log(userURLS)
    let templateVars = { urls: userURLS, username: users[req.cookies['user_id']]}
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    if (!req.cookies['user_id']) {
        res.redirect('/login')
    }
    console.log(urlDatabase)
    let templateVars = { username: users[req.cookies['user_id']] }
    res.render('urls_new', templateVars)
})

app.post("/urls", (req, res) => {

    const keyArray = Object.keys(req.body)
    const uniqueID = generateRandomString()
    for(let key of keyArray){
        urlDatabase[uniqueID] = { longURL: req.body[key], userID: req.cookies['user_id']}
    }
    res.redirect(`/urls/${uniqueID}`)
})

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], username: users[req.cookies['user_id']]};
    res.render('urls_show', templateVars);
})

app.post('/urls/:shortURL/delete', (req, res) => {
    if(urlDatabase[req.params.shortURL]['userID'] === req.cookies['user_id']) {
      delete urlDatabase[req.params.shortURL] 
      res.redirect('/urls')
    } else {
      res.status(403)
      res.send('You do not have access')
    }
})

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
})

app.get("/u/:shortURL", (req, res) => {
    res.redirect(urlDatabase[req.params.shortURL]['longURL'])
  });

app.post('/urls/:id', (req, res) => {
    const responseKey = Object.keys(req.body)
    if (urlDatabase[responseKey[0]]['userID'] === req.cookies['user_id']) {
      urlDatabase[responseKey[0]]['longURL'] = req.body[responseKey[0]]
      res.redirect('/urls') 
    } else {
      res.status(403)
      res.send('You do not have access')
    }
 });

app.get('/login', (req, res) => {
    res.render('loginPage')
})

 app.post('/login', (req, res, next) => {
     const { email, password } = req.body
     if (loginChecker(email, password) === 'NoEmail') {
         res.status(403)
         next('No email exists')
     } else if(loginChecker(email, password) === 'WrongP') {
         res.status(403)
         next('Password Incorrect')
     } else {
         res.cookie('user_id', emailLookup(email, users)) 
         res.redirect('/urls')
     }
     })

 app.post('/logout', (req, res) => {
     res.clearCookie('user_id')
     res.redirect('/urls')  
 })

 app.get('/register', (req, res) => {
     res.render('registrationPage')
 })

 app.post('/register', (req, res, next) => {
     const { email, password } = req.body
       if (email === '' || password === '') {
        res.status(400)
        next('No user name or password exists')
       } else if (emailLookup(email, users)) {
        res.status(400)
        next('Email already exists')
       } else {
     const id = generateRandomString()
     res.cookie('user_id', id )
     users[id] = { id, email, password }
     res.redirect('/urls')
       }
 })

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})

