const bodyParser = require("body-parser");
const morgan = require('morgan')
const express = require('express')
const app = express();
const PORT = 8080;

app.use(morgan('dev'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
    return Math.random().toString(36).replace('0.', '').substr(0, 6)
}

const urlDatabase = {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    'google': 'http://www.google.com',
};

app.get('/', (req,res) => {
    res.send('Hello!')
})

app.get('/urls', (req, res) => {
    let templateVars = { urls: urlDatabase }
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    res.render('urls_new')
})

app.post("/urls", (req, res) => {
    const keyArray = Object.keys(req.body)
    const uniqueID = generateRandomString()
    console.log(urlDatabase)
    for(let key of keyArray){
        urlDatabase[uniqueID] = req.body[key]
    }
    res.redirect(`/urls/${uniqueID}`)
})

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });

app.post('/urls/:id', (req, res) => {
    const responseKey = Object.keys(req.body)
    urlDatabase[responseKey[0]] = req.body[responseKey[0]]
    res.redirect('/urls')
 });

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})