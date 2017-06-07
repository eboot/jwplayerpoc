console.log('Trying to start the server');

const express = require('express');
const fs = require('fs');
const hbs = require('hbs');

const PORT = process.env.PORT || 3001;

var app = new express();
var router = express.Router();

var routes = require('./routes/route');
app.use('/', routes);

hbs.registerPartials(__dirname+'/views/partials');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

hbs.registerHelper("getCurrentYear", () => {
  return new Date().getFullYear();
});

app.listen(PORT, ()=>{
  console.log(`Server started on port: ${PORT}`)
})
