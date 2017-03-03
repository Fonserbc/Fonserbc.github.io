// HTML5 audio player + playlist controls...
// Inspiration: http://jonhall.info/how_to/create_a_playlist_for_html5_audio
// Mythium Archive: https://archive.org/details/mythium/
$(function () {
    // Add user agent as an attribute on the <html> tag...
    // Inspiration: http://css-tricks.com/ie-10-specific-styles/
    var b = document.documentElement;
    b.setAttribute('data-useragent', navigator.userAgent);
    b.setAttribute('data-platform', navigator.platform);
    
    var playlistNames = ["songwriting", "tetrapod", "duo", "band"];
    var playlists = {
        "songwriting" : [
            {
                "name": "The 5 Min In Between",
                "length": "00:57",
                "file": "songwriting/5min"
            },
            {
                "name": "Absinthe  (Theme of movie 'Double Date')",
                "length": "00:57",
                "file": "songwriting/Absinthe"
            },
            {
                "name": "I Fall Asleep Too Easily",
                "length": "00:57",
                "file": "songwriting/Fall Asleep"
            },
            {
                "name": "雨樹澄黃",
                "length": "00:57",
                "file": "songwriting/Golden shower tree"
            },
            {
                "name": "Beer and Gossip",
                "length": "00:57",
                "file": "songwriting/Beer and Gossip"
            },
            {
                "name": "Street Carol",
                "length": "00:57",
                "file": "songwriting/Street Carol"
            },
            {
                "name": "畢業序曲",
                "length": "00:57",
                "file": "songwriting/Graduation overture"
            },
            {
                "name": "Sweetest Single Valentine",
                "length": "00:57",
                "file": "songwriting/Sweetest single valentine"
            },
            {
                "name": "Tromsø Sky (ft. CvA Jazz Choir)",
                "length": "00:57",
                "file": "songwriting/Tromso Sky"
            },
            {
                "name": "Leaving",
                "length": "00:57",
                "file": "songwriting/leaving"
            }
        ],
        "tetrapod" : [
            {
                "name": "Copy Machine",
                "length": "00:32",
                "file": "tetrapod/Copy Machine"
            },
            {
                "name": "Garlic Skin",
                "length": "00:34",
                "file": "tetrapod/Garlic Skin"
            },
            {
                "name": "Elephants Remember",
                "length": "00:30",
                "file": "tetrapod/Elephants remember"
            },
            {
                "name": "Cicada and Banyan Tree",
                "length": "00:34",
                "file": "tetrapod/Cicada and Banyan Tree"
            }
        ],
        "duo" : [
            {
                "name": "Easy Living",
                "length": "00:30",
                "file": "duo/Easy living"
            },
            {
                "name": "The Song Is You",
                "length": "00:57",
                "file": "duo/The Song Is You"
            },
             {
                "name": "Speak Low",
                "length": "00:57",
                "file": "duo/Speak low"
            },
            {
                "name": "God Bless The Child",
                "length": "00:57",
                "file": "duo/God bless the child"
            },
            {
                "name": "Love For Sale",
                "length": "00:57",
                "file": "duo/Love For Sale_1"
            },
            {
                "name": "Alone Together",
                "length": "00:57",
                "file": "duo/Alone Together"
            },
            {
                "name": "Joy Spring",
                "length": "00:40",
                "file": "duo/Joy Spring"
            },
            {
                "name": "Darn That Dream",
                "length": "00:57",
                "file": "duo/Darn That dream"
            },
            {
                "name": "Falsa Baiana",
                "length": "00:30",
                "file": "duo/Falsa Baiana1"
            },
            {
                "name": "Skylark",
                "length": "00:57",
                "file": "duo/Skylark"
            }            
        ],
        "band" : [
            {
                "name": "I've Got You Under My Skin (ft. KoSwing Big Band)",
                "length": "00:34",
                "file": "band/I've got you under my skin"
            },
            {
                "name": "Hi Fly",
                "length": "00:32",
                "file": "band/Hi Fly"
            },
            {
                "name": "The Boy Next Door",
                "length": "00:34",
                "file": "band/The Boy Next Door"
            },
            {
                "name": "Night And Day (ft. Taipei Riot Big Band)",
                "length": "00:30",
                "file": "band/Night and Day"
            },
            {
                "name": "On A Clear Day",
                "length": "00:34",
                "file": "band/On a Clear Day"
            },
            {
                "name": "Cry Me a River",
                "length": "00:34",
                "file": "band/Cry me a River"
            },
            {
                "name": "Se Todos Fossem Iguais A Você",
                "length": "00:32",
                "file": "band/Se Todos Voce"
            },
            {
                "name": "On The Sunny Side Of The Street (ft. KoSwing Big Band)",
                "length": "00:30",
                "file": "band/Sunnyside of the Street"
            },
            {
                "name": "I'll Remember April",
                "length": "00:30",
                "file": "band/I'll remember april"
            } 
        ]
    };
    
    var supportsAudio = !!document.createElement('audio').canPlayType;
    if (!supportsAudio) {
        return;
    }
    
    var audioPlayers = [];
    function nowPlaying(a) {
        for (let i = 0; i < audioPlayers.length; ++i) {
            if (a !== audioPlayers[i]) {
                audioPlayers[i].pause();
            }
        }
    }
    
    function buildPlaylist (n) {
        let trackCount = 0;
        let name = n;
        let li;
        let index = 0,
            playing = false,
            mediaPath = 'music/',
            extension = '.mp3',
            player = $("#"+name),
            listElement = player.find("#listElement"),
            list = player.find('#plList'),
            npAction = player.find('#npAction'),
            npTitle = player.find('#npTitle'),
            audio = player.find('#audio1').on('play', function () {
                playing = true;
                npAction.text('Now Playing...');
                nowPlaying(audio);
            }).on('pause', function () {
                playing = false;
                npAction.text('Paused...');
            }).on('ended', function () {
                npAction.text('Paused...');
                if ((index + 1) < trackCount) {
                    index++;
                    loadTrack(index);
                    audio.play();
                } else {
                    audio.pause();
                    index = 0;
                    loadTrack(index);
                }
            }).get(0),
            btnPrev = player.find('#btnPrev').click(function () {
                if ((index - 1) > -1) {
                    index--;
                    loadTrack(index);
                    if (playing) {
                        audio.play();
                    }
                } else {
                    audio.pause();
                    index = 0;
                    loadTrack(index);
                }
            }),
            btnNext = player.find('#btnNext').click(function () {
                if ((index + 1) < trackCount) {
                    index++;
                    loadTrack(index);
                    if (playing) {
                        audio.play();
                    }
                } else {
                    audio.pause();
                    index = 0;
                    loadTrack(index);
                }
            }),
            loadTrack = function (id) {
                player.find('.plSel').removeClass('plSel');
                player.find('#plList li:eq(' + id + ')').addClass('plSel');
                npTitle.text(playlists[name][id].name);
                index = id;
                audio.src = mediaPath + playlists[name][id].file + extension;
            },
            playTrack = function (id) {
                loadTrack(id);
                audio.play();
                console.log(id);
            },
            loadPlaylist = function () {
                audio.pause();
                list.empty();

                for (let i = 0; i < playlists[name].length; ++i) {
                    let newElement = listElement.clone();
                    newElement.find(".plNum").text((i+1)+".");
                    newElement.find(".plTitle").text(playlists[name][i]["name"]);
                    //newElement.find(".plLength").text(playlists[name][i]["length"]);
                    newElement.removeClass("hidden");
                    list.append(newElement);
                }

                li = list.find('li').click(function () {    
                    var id = parseInt($(this).index());
                    if (id !== index || audio.paused) {
                        playTrack(id);
                    }
                });

                trackCount = playlists[name].length;
                index = 0;
                loadTrack(index);
            };
        
        loadPlaylist(name);

        return audio;
    }
    
    for (let i = 0; i < playlistNames.length; ++i) {
        audioPlayers.push(buildPlaylist(playlistNames[i]));
    }
    
    //extension = audio.canPlayType('audio/mpeg') ? '.mp3' : audio.canPlayType('audio/ogg') ? '.ogg' : '';
});