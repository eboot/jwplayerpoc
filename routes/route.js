const express = require('express');

var app = new express();
var router = express.Router();
var appTitle = "JW Player POC";

router.get('/',(req,res)=>{
  res.render('playlist.hbs',{
    appTitle: appTitle,
    pageTitle: 'Playlist | Mattel',
    hasNav: true,
  });
});

router.get('/mattelvideoplayer',(req,res)=>{
  res.render('mattelvideoplayer.hbs',{
    appTitle: appTitle,
    pageTitle: 'Playlist | Mattel',
    hasNav: true,
  });
});

module.exports = router;
