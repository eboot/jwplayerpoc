const express = require('express');
const axios = require('axios');

var app = new express();
var router = express.Router();
var appTitle = "JW Player POC";
var playlistUrl = "https://cdn.jwplayer.com/v2/playlists/Mx7YyYDQ";

router.get('/',(req,res)=>{
  res.render('playlist.hbs',{
    appTitle: appTitle,
    pageTitle: 'Playlist | Mattel',
    hasNav: true
  });
});

router.get('/mattelvideoplayer',(req,res)=>{
  axios.get(playlistUrl).then((response)=>{
    // console.log(response.data.playlist);
    res.render('mattelvideoplayer.hbs',{
      appTitle: appTitle,
      pageTitle: 'Playlist | Mattel',
      hasNav: true,
      playlist: response.data.playlist
    });
  }).catch((error)=>{
    console.log(error);
    res.redirect('/');
  });
});

module.exports = router;
