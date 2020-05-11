const bodyParser = require("body-parser");
const express = require('express')
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
    return Math.floor(Math.random() * 1000000)
}



const urlDatabase = {
    'lighthouse': 'http://www.lighthouselabs.ca',
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
    console.log(req.body);   
    res.send('OK');          
  });

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render('urls_show', templateVars);
})

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n'); 
})


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})