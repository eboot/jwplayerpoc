
/*
 *  File Name: MattelVideoPlayer.js 
 *  Purpose: ooyala Migration for Mattel Brands
 *  File Version: 5.1 
 *  Plugin Included: MasterPlugin.js-Bundled (core.min.js,main_html5.min.js,html5-skin.min.js) , html5-skin.min.css
 *  Plugin Version : 4.3.3
 */
 
var MattelVideoPlayer = {};
MattelVideoPlayer.ooPlayerInstances = {};
MattelVideoPlayer.ooyalaApiLoaded = false;

(function() {
    MattelVideoPlayer.playerScenarios = {
        thumbnailNreload: false,
        thumbnailNonreload: false,
        singlePlayer: false,
        multiplayer: false
    };

    var screenWidth,
        haveVideoToLoad = false,
        videoContainers = [],
        generatedExtId = "",
        completedVideo=false,
        apiLoaded = false,
        dynamicElement,
        brandPlayerIds,
        pCodeVal,
        hostedDomain = "https://beta.static.mattel.com/videoplayer/src/js/v4/",
        playListDomain = "https://player.ooyala.com/v3/",
        playerV4 = "https://player.ooyala.com/static/v4/stable/",
        bodyElementTag,
        ooyalaVersion = '4.3.3',
        build = 002,
        headElementTag;


    // creating and binding ooyala plugins like css,js
    function renderOoyalaApi(callback) {
        videoContainers = document.getElementsByClassName("ooyala-video-player"),
        brandPlayerIds = document.getElementById("oo-player-id") != null ? document.getElementById("oo-player-id").children[0].value : [],
        pCodeVal = document.getElementById("oo-player-pcode") != null ? document.getElementById("oo-player-pcode").value : [],
        playListPlayerId = document.getElementById("oo-playlist-id") != null ? document.getElementById("oo-playlist-id").value : [],
        bodyElementTag = document.getElementsByTagName('body')[0],
        headElementTag = document.getElementsByTagName("head")[0],
    MattelVideoPlayer.ooPlayerInstances.players = [];
    //bodyElementTag.appendChild(fileBinding('js',hostedDomain+"ooyala-master-plugin.js",callback));
    //bodyElementTag.appendChild(fileBinding('js',"/static/js/ooyala-master-plugin.js",callback));
    //bodyElementTag.appendChild(fileBinding('js',playerV4+"4.3.3/ad-plugin/ad_manager_vast.min.js",callback));
    if((".ooyala-video-player[data-customPlayer]").length > 0 && playListPlayerId != null  && playListPlayerId != ""){
        bodyElementTag.appendChild(fileBinding('js',playListDomain+playListPlayerId+'?platform=html5-priority',callback));
    }
    headElementTag.appendChild(fileBinding('css',playerV4+ooyalaVersion+"/skin-plugin/html5-skin.min.css"));
    headElementTag.appendChild(fileBinding('css',hostedDomain+"ooyala-overridden.css?bld="+build));
    }

    // Rendering script / css file based on the dynamic url
    function fileBinding(fileName,fileUrl,callBack){
        if(fileName=="js"){
                dynamicElement = document.createElement('script'),           
                dynamicElement.src = fileUrl ;
                if(typeof callBack == "function") dynamicElement.onload = callBack;
        }
        else if(fileName=="css"){
            dynamicElement = document.createElement("link");
            dynamicElement.setAttribute("rel", "stylesheet")
            dynamicElement.setAttribute("type", "text/css")
            dynamicElement.setAttribute("href", fileUrl)    
        }
        return dynamicElement;
    }
 
    /**
     For each player in the page, setting the scenario based on the following player Tag Element ID
     @divId: (passed as parameter)player Tag Element ID
     @Functionality: Detects and sets the player scenario for further player playback.
    **/
    function scenarioDetector(divId, indx) {
        MattelVideoPlayer.playerScenarios = {
            thumbnailNreload: ($("#" + divId).attr('data-contains-thumbnailNreload') != null) ? $("#" + divId).attr('data-contains-thumbnailNreload') : undefined,
            thumbnailNonreload: ($("#" + divId).attr('data-contains-thumbnailNonreload') != null) ? $("#" + divId).attr('data-contains-thumbnailNonreload') : undefined,
            singlePlayer: ($("#" + divId).attr('data-singlePlayer') != null) ? $("#" + divId).attr('data-singlePlayer') : undefined,
            multiplayer: ($("#" + divId).attr('data-multiplePlayer') != null) ? $("#" + divId).attr('data-multiplePlayer') : undefined,
            customPlayer: ($("#" + divId).attr('data-customPlayer') != null) ? $("#" + divId).attr('data-customPlayer') : undefined,
            slidingPlayerOnPage: ($('[data-slidertype ="flexSlider"]').length) ? $('[data-slidertype ="flexSlider"]') : (($('[data-slidertype ="bxSlider"]').length) ? $('[data-slidertype ="bxSlider"]') : undefined)

        }
        scenarioBasedConfig(divId, indx);
        eventBinders();
    }

    // Based on the detected scenario, do some config on detected scenarios
    function scenarioBasedConfig(divId, indx) {
        if (MattelVideoPlayer.playerScenarios.thumbnailNonreload) {
            /**
            This block prevents the default behavior of anchor tag, as the scenario set as THUMBNAIL-NON-RELOAD 
            (i.e., loads the video without reloading the page, A fallback to prevent default behavior)
            **/
            MattelVideoPlayer.ooPlayerInstances.players[indx] = startOoyalaPlayer(divId, $("#" + divId).data('videoId'));
            var listEl = $('.thumbnail-video-list .video-list-item a');
            if (listEl != null) {
                // binding click event based on the jquery version
                if (typeof $.fn.live == "function") {
                    listEl.live('click', function(e) { /** ---for jquery < 1.7 --**/
                        e.preventDefault();
                    })
                } else if (typeof $.fn.on == "function") { /** ---for jquery >= 1.7 --**/
                    listEl.on('click', function(e) {
                        e.preventDefault();
                    })
                }
            }
        } else if (MattelVideoPlayer.playerScenarios.thumbnailNreload) {
            MattelVideoPlayer.ooPlayerInstances.players[indx] = startOoyalaPlayer(divId, $("#" + divId).data('videoId'));
        } else if (MattelVideoPlayer.playerScenarios.customPlayer) {
            MattelVideoPlayer.ooPlayerInstances.players[indx] = startOoyalaPlayer(divId, $("#" + divId).data('playlistId'), true);
        } else {
            MattelVideoPlayer.ooPlayerInstances.players[indx] = (haveVideoToLoad) ? startOoyalaPlayer(divId, generatedExtId) : startOoyalaPlayer(divId, $("#" + divId).data('videoId'));
        }
    }

    // slider Overlay for navigations 
    MattelVideoPlayer.playerNavigationControl = function(currentSlider) {
        $(MattelVideoPlayer.ooPlayerInstances.players).each(function(index, item) {
            item.mb.publish(OO.EVENTS.PAUSE, true)
        });
        if (typeof(currentSlider) == "undefined") return false;
        MattelVideoPlayer.ooPlayerInstances.players[currentSlider].play();
    }

    // Pre-configures and generates the unique ooyala player ID for each player in the page
    function ooVideoSetters() {
        if(typeof OO ==="undefined") return; 
        OO.ready(function() {
            if (!$('div[ooyala-Overlay]').length) playerLoading();
        });
        if ($('[ooyala-video-slider]').length > 0) {
            MattelVideoPlayer.ooPlayerInstances = {};
            MattelVideoPlayer.ooPlayerInstances.players = []
            playerLoading();
        } else if ($('[ooyala-Overlay]').hasClass('activeOverlay')) {
            playerLoading();
        }

    }

    // Generates and sets the unique id attribute for player containers
    function playerLoading() {
    
        for (var i = 0; i < videoContainers.length; i++) {
            videoContainers[i].setAttribute('id', 'video-container-' + (i + 1));
            if (!haveVideoToLoad) {
                scenarioDetector(videoContainers[i].getAttribute('id'), i);
            } else {
                scenarioDetector(videoContainers[i].getAttribute('id'), i);
                break;
            }
        }
    }

    // Binds the events for the thumbnails if available in the page
    function eventBinders() {
       
            /** This block helps in handling events for "thumbnailNonreload" scenarios 
                (i.e., clicking on thumbnail, loads appropriate video in the player)
            **/
            if (typeof $.fn.live == "function") {
                 if (MattelVideoPlayer.playerScenarios.thumbnailNonreload) {
                    $('.thumbnail-video-list .video-list-item').live('click', function(ev) {
                        playerBinding(this);
                        $('.video-list-item').removeClass('oo-thumbnail-active');
                        $(ev.currentTarget).addClass('oo-thumbnail-active');
                    })
                 }
                $('.replay[op-control-replay]').live('click',function(ev){
                    MattelVideoPlayer.ooPlayerInstances.players[0].play();
                });
            } else if (typeof $.fn.on == "function") { /** ---for jquery >= 1.7 --**/
                if (MattelVideoPlayer.playerScenarios.thumbnailNonreload) {
                    $('.thumbnail-video-list').on('click', '.video-list-item', function(ev) {
                        playerBinding(this);
                        $('.video-list-item').removeClass('oo-thumbnail-active');
                        $(ev.currentTarget).addClass('oo-thumbnail-active');
                    })
                }
                $(document).on('click','.replay[op-control-replay]',function(ev){
                    MattelVideoPlayer.ooPlayerInstances.players[0].play();
                });
            }
        //}
    }

    // Binds the thumbnail events for the thumbnails non-relaoding page 
    function playerBinding(curEle) {
        var externalId = $(curEle).data('videoId'),
            contentId = (externalId.length >= 32 || externalId.indexOf('extId:') != -1) ? externalId : "extId:" + externalId,
            playerClass = document.getElementsByClassName("ooyala-video-player");
            
        if(MattelVideoPlayer.ooPlayerInstances.players.length==1){
            playerEmbedCode(MattelVideoPlayer.ooPlayerInstances.players[0],contentId);
            $('[data-contains-thumbnailnonreload=true]').data("videoId",contentId);
            return false;
        }
        
        for (var j = 0; j < playerClass.length; j++) {
            for (var i = 0; i < curEle.parentElement.children.length; i++) {
                if (playerClass[j].getAttribute('data-video-id') == curEle.parentElement.children[i].getAttribute('data-video-id')) {
                    var splittedVal = playerClass[j].getAttribute('id').split("-");
                    playerIndex = (playerClass[j].getAttribute('id').split("-")[splittedVal.length - 1]) - 1;
                    playerEmbedCode(MattelVideoPlayer.ooPlayerInstances.players[playerIndex],contentId);
                    break;
                }
            }
        }
    }
    function playerEmbedCode(_player,_contentid){
        _player.setEmbedCode(_contentid);
        _player.play();
    }

    //Telium Events tracker for OOYALA PLAYER
    function OOEventTracking(action, curTitle) {
        utag.link({
            event_id: action,
            event_category_id: "Videos",
            eve_lab: curTitle
        });
    }

    // Instantiates ooyala Player
    function startOoyalaPlayer(divId, externalId, isCustomPlayer) {
        var playingVideo = false,
            previousEvent = '',
            player, contentId,playerParam;
            
        contentId = (externalId.length >= 32 || externalId.indexOf('extId:') != -1) ? externalId : "extId:" + externalId;
        if (typeof isCustomPlayer != 'undefined' && isCustomPlayer) {
            //custom player (playlists)
            var arr = [];
            arr.push(contentId);
             player = OO.Player.create(divId,'',{
                'pcode':pCodeVal,
                "playerBrandingId" : brandPlayerIds,
                'autoplay': $('#' + divId).data('autoplay'),
                'playlistsPlugin': {
                    'data': arr,
                    'orientation' : 'horizontal',
                    'position': 'bottom',
                    'thumbnailsSize' : '300px',
                    'wrapperFontSize' : '18px'
                },
                'debug':true,
                'width': '100%',
                'height': '100%',
                'useFirstVideoFromPlaylist': true,
                'loop': false
            });
        } else { // standard player
            player = OO.Player.create(divId, contentId,{
                'pcode':pCodeVal,
                "playerBrandingId" : brandPlayerIds,
                'autoplay': $('#' + divId).data('autoplay'),
                'width': '100%',
                'height': '100%',
                'wmode': 'transparent',
                "skin": {
                    // Config contains the configuration setting for player skin. Change to your local config when necessary.
                    "config": playerV4+ooyalaVersion+"/skin-plugin/skin.json",
                    //Put your player customizations here to override settings in skin.json. The JSON object must match the structure of skin.json
                     "inline": {
                          "startScreen": {"showTitle": false, "playIconStyle": {"color": "white", "opacity" : 1}},
                          "pauseScreen": {"showTitle": false}

                        }
                  }
            });
        }

        /** tracking code for player ready/play **/
        player.mb.subscribe(OO.EVENTS.PLAYING, 'Playing', function(event) {
            if (previousEvent != event) {
                if (!playingVideo) {
                    playingVideo = true;
                    completedVideo=true;
                    // OOEventTracking('Launch',MattelVideoPlayer.ooPlayerInstances.players[0].getCurrentItemTitle());
                } else {
                    // OOEventTracking('Play',MattelVideoPlayer.ooPlayerInstances.players[0].getCurrentItemTitle());
                }
            }
            previousEvent = event;
        });

        /** tracking code for player paused **/
        player.mb.subscribe(OO.EVENTS.PAUSED, 'Paused', function(event) {
            if (playingVideo && previousEvent != event && previousEvent != 'played') {
                // OOEventTracking('Pause',MattelVideoPlayer.ooPlayerInstances.players[0].getCurrentItemTitle());
                previousEvent = event;
            }
            
        });

        /** tracking code for player end/completed **/
        player.mb.subscribe(OO.EVENTS.PLAYED, 'completed', function(event) {
            // OOEventTracking('Completed',MattelVideoPlayer.ooPlayerInstances.players[0].getCurrentItemTitle());
            if (MattelVideoPlayer.playerScenarios.thumbnailNonreload && previousEvent!=event && completedVideo) {
                completedVideo=false;
                MattelVideoPlayer.ooPlayerInstances.players[0].mb.publish(OO.EVENTS.PAUSE, false)
                /** --- calling the function for autoplaying next video --- **/
                var curId=$('[data-contains-thumbnailnonreload=true]').data('video-id')
                var curEle=$('.thumbnail-video-list .video-list-item[data-video-id="' +((curId.indexOf('extId') != -1) ? curId.split(':')[1] : curId)+ '"]');
                if(($(curEle).next()&& $(curEle).length)>0){
                   $(curEle).next().click();
                }else{
                   $('.thumbnail-video-list .video-list-item:first-child').click();
                }
            }
            playingVideo = false;
            previousEvent = event;
        });

        /** tracking code for player destroy **/
        player.mb.subscribe(OO.EVENTS.DESTROY, 'destroy', function(event) {
            console.log("Destroy")
        });

        return player;
    }

    // Destroy the ooyala player 
    MattelVideoPlayer.destroyVideos = function() {
        $(MattelVideoPlayer.ooPlayerInstances.players).each(function(index, item) {
            item.mb.publish(OO.EVENTS.DESTROY, true)
        })
    }

    /*** Slider Actions Begins***/
    MattelVideoPlayer.sliderActions = {};
    MattelVideoPlayer.sliderActions = {
            'findVideoPos': function(self, sliderType) {
                if (sliderType != "bxslider") { //flexslider
                    this.nthVideo = -1; // Detects the slide where the video resides.
                    this.elementId = "";
                    var that = this;
                    $(self.selector).each(function(key, item) {
                        if (!$(item).hasClass('clone')) {
                            if ($(item).find('.player-wrapper').length) {
                                that.nthVideo++;
                                that.elementId = $(item).find('.ooyala-video-player').attr('id');
                            }
                            if ($(item).hasClass('flex-active-slide')) {
                                return false;
                            }
                        }
                    })
                } else if (sliderType == "bxslider") { //bxslider
                    //not required as of now
                }
            },
            'beforeAction': function(slider, self, previousSlide, currentSlide, sliderType) {
                if (sliderType != "bxslider") { //flexslider
                    // chk whether the current slide contains video or not.
                    var slideHasVideo = ($('.flex-active-slide').find('.player-wrapper').length) ? true : false;
                    MattelVideoPlayer.sliderActions.findVideoPos(self, sliderType);
                    console.log(this.nthVideo);
                    if (slideHasVideo) { // if video found in current slide, pause it.
                        var x = this.elementId;
                var y = MattelVideoPlayer.ooPlayerInstances.players.filter(function(v,k){return (x==v.getElementId())})
                if(y.length>0){
                    y[0].pause();
                }
                        //MattelVideoPlayer.ooPlayerInstances.players[this.nthVideo].pause();
                        slider.play();
                    }
                } else if (sliderType == "bxslider") { //bxslider
                    //not required as of now   
                }
            },
            'afterAction': function(slider, self, previousSlide, currentSlide, sliderType) {
                if (sliderType != "bxslider") { //flexslider
                    // chk whether the current slide contains video or not.
                    var slideHasVideo = ($('.flex-active-slide').find('.player-wrapper').length) ? true : false;
                    MattelVideoPlayer.sliderActions.findVideoPos(self, sliderType);
                    if (slideHasVideo) { // if video found in current slide, play video and pause slider.
                        //MattelVideoPlayer.ooPlayerInstances.players[this.nthVideo].play();
                        var x = this.elementId;
                        var y = MattelVideoPlayer.ooPlayerInstances.players.filter(function(v,k){return (x==v.getElementId())})
                        if(y.length>0 && !y[0].isPlaying()){
                            y[0].play();
                            slider.pause();
                            //slider.play();
                                //setTimeout(function(){
                                //slider.pause();
                                 //$('[data-slidertype ="flexSlider"]').flexslider('pause')
                            //},1000);
                        }

                        

                    } else { // if video is not in current slider play slider
                        slider.play();
                    }
                } else if (sliderType == "bxslider") { //bxslider
                    $('.bx-active-slide').removeClass('bx-active-slide');
                    self.parent().find('> li').eq(currentSlide).addClass('bx-active-slide')
                    if (self.parent().find('li').eq(currentSlide).find('.player-wrapper').length) {
                        MattelVideoPlayer.ooPlayerInstances.players.forEach(function(player, indx) {
                            if (self.find('.ooyala-video-player').attr('id') == player.elementId) {
                                player.play();
                            } else {
                                player.pause();
                            }
                            player.mb.subscribe(OO.EVENTS.PLAYED, '', function(event) {
                                $(self).parentsUntil('[data-slidertype="bxSlider"]').find('.bx-next').trigger('click');
                            });
                        })
                    }
                }
            },
            'startAction': function(slider, self, previousSlide, currentSlide, sliderType) {
                if (sliderType != "bxslider") { //flexslider
                    // 1. Initially pause the slider
                    slider.pause();
                    // Go through all the player instances 
                    MattelVideoPlayer.ooPlayerInstances.players.forEach(function(player, indx) {
                        MattelVideoPlayer.ooPlayerInstances.players[0].play();
                        // Handle Video Pause Event 
                        player.mb.subscribe(OO.EVENTS.PAUSED, '', function(event) {
                            slider.play();
                            $('[data-slidertype ="flexSlider"]').play();
                        });
                        // Handle Video Completed Playing Event 
                        player.mb.subscribe(OO.EVENTS.PLAYED, '', function(event) {
                            $('[data-slidertype ="flexSlider"]').flexslider(((slider.currentSlide + 1) < slider.pagingCount) ? slider.currentSlide + 1 : 0);
                            slider.play();
                        });
                        player.mb.subscribe(OO.EVENTS.PLAYING, '', function(event) {
                           // slider.pause();
                        });
                    });
                } else if (sliderType == "bxslider") { //bxslider  
                    $(self).parent().find('li').eq(1).addClass('bx-active-slide')
                    $(self).parent().find('> li').addClass('slide')
                    $(self).parent().find('.bx-clone').removeClass('slide')
                        // Go through all the player instances 
                    MattelVideoPlayer.ooPlayerInstances.players.forEach(function(player, indx) {
                        MattelVideoPlayer.ooPlayerInstances.players[0].play();
                        // Handle Video Pause Event
                        player.mb.subscribe(OO.EVENTS.PAUSED, '', function(event) {
                            slider.startAuto();
                        });
                        // Handle Video Completed Playing Event
                        player.mb.subscribe(OO.EVENTS.PLAYED, '', function(event) {
                            //slider.goToNextSlide();
                        });
                        // Handle the player ready to play Event
                        player.mb.subscribe(OO.EVENTS.PLAYBACK_READY, '', function(event) {
                            slider.stopAuto();
                        });
                        player.mb.subscribe(OO.EVENTS.PLAYING, '', function(event) {
                            slider.stopAuto();
                        });
                    });
                }
            }
        }
        /*** Slider Actions Ends***/

    // initiate the functionality to be triggered on page load
    windowOnLoad = function() {
        if (MattelVideoPlayer.ooyalaApiLoaded) {
            var getHiddenVideoId = document.getElementById('charComponentUri');
            if (getHiddenVideoId != null) {
                var videoListItem = document.getElementsByClassName('video-list-item');
                if (getHiddenVideoId.value == "") {
                    generatedExtId = videoListItem[0].getAttribute('data-video-id');
                } else {
                    for (var i = 0; i < videoListItem.length; i++) {
                        if (videoListItem[i].getAttribute('videoTcmId') == getHiddenVideoId.value) {
                            generatedExtId = videoListItem[i].getAttribute('data-video-id');
                            break;
                        }
                    }
                }
                /**  
                    Flagging this variable for thumbnail reload
                    (i.e, clicking thumbnail, reloads the page and play the clicked video on load)
                **/
                haveVideoToLoad = true;
            }
            ooVideoSetters();
        }
    }
    // ooyala API initialization
    MattelVideoPlayer.init = function() {
        MattelVideoPlayer.ooyalaApiLoaded = apiLoaded = (typeof OO!="undefined") ? true : false;
        if (MattelVideoPlayer.ooyalaApiLoaded && apiLoaded) windowOnLoad(); 

    }

    setTimeout(function() {
        renderOoyalaApi();
        MattelVideoPlayer.init();
    }, 1000);

}());

$(function() {
    if(!MattelVideoPlayer.ooyalaApiLoaded){
        MattelVideoPlayer.ooyalaApiLoaded = true;
        MattelVideoPlayer.init();
    }
})