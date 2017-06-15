const express = require('express');
const axios = require('axios');
//var $ = require('jQuery');

var app = new express();
var router = express.Router();
var appTitle = "JW Player POC";
var playlistUrl = "https://cdn.jwplayer.com/v2/playlists/6x0GWItI";
var videoSourceIndex = 3;

router.get('/',(req,res)=>{
  res.render('playlist.hbs',{
    appTitle: appTitle,
    pageTitle: 'Playlist | Mattel',
    hasNav: true
  });
});

router.get('/adpoc',(req,res)=>{
  res.render('adpoc.hbs',{
    appTitle: appTitle,
    pageTitle: 'Ad POC | Mattel',
    hasNav: true
  });
});

router.get('/adpochtml5',(req,res)=>{
  res.render('adpochtml5.hbs',{
    appTitle: appTitle,
    pageTitle: 'Ad POC HTML5 | Mattel',
    hasNav: true,
  });
});

router.get('/mattelvideoplayer',(req,res)=>{
  axios.get(playlistUrl).then((response)=>{
    // console.log(response.data.playlist);
    res.render('mattelvideoplayer.hbs',{
      appTitle: appTitle,
      pageTitle: 'Playlist | Mattel',
      hasNav: true,
      videoSourceIndex: videoSourceIndex,
      playlist: response.data.playlist,
      vertical: false
    });
  }).catch((error)=>{
    console.log(error);
    res.redirect('/');
  });
});

router.get('/playlistverticalcarousel',(req,res)=>{
  axios.get(playlistUrl).then((response)=>{
    // console.log(response.data.playlist);
    res.render('mattelvideoplayer.hbs',{
      appTitle: appTitle,
      pageTitle: 'Playlist | Mattel',
      hasNav: true,
      videoSourceIndex: videoSourceIndex,
      playlist: response.data.playlist,
      vertical: true
    });
  }).catch((error)=>{
    console.log(error);
    res.redirect('/');
  });
});

module.exports = router;
