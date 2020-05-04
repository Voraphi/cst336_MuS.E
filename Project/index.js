/* App Configuration */
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var multer = require('multer');
var request = require("request");
var session = require('express-session');
var bcrypt = require('bcrypt');
var app = express();
app.use(express.static("css"));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'top secret code!',
    resave: true,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');


/* Configure MySQL DBMS */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'adminy',
    password: 'admin',
    database: 'filedb'
});
connection.connect();

/* Middleware */
let storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname, 'public/file/'))
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now())
    }
});
let upload = multer({ storage: storage });


/* Middleware */
function isAuthenticated(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login');
    }
    else next();
}

function isAuthNameSearch(req, res, next) {
    if (req.session.authenticated) {
        res.redirect('/lyrical-search-auth');
    }
    else next();
}

function isAuthLyricSearch(req, res, next) {
    if (req.session.authenticated) {
        res.redirect('/song-search-auth');
    }
    else next();
}


function isLoggedIn(req, res, next) {
    if (req.session.authenticated) {
        res.redirect('/');
    }
    else next();
}

function checkUsername(username) {
    let stmt = 'SELECT * FROM users WHERE username=?';
    return new Promise(function(resolve, reject) {
        connection.query(stmt, [username], function(error, results) {
            if (error) throw error;
            resolve(results);
        });
    });
}

function checkPassword(password, hash) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(password, hash, function(error, result) {
            if (error) throw error;
            resolve(result);
        });
    });
}

function returnUserId(username) {
    let stmt = 'SELECT userId FROM users WHERE username=?';
    return new Promise(function(resolve, reject) {
        connection.query(stmt, [username], function(error, results) {
            if (error) throw error;
            resolve(results);
        });
    });

}


/* Home Route*/
app.get('/', isAuthNameSearch, function(req, res) {
    res.render('searchLyricsNotAuth', { apiError: false });
});

app.get('/song-search-auth', function(req, res) {
    res.render('searchByLyricsAuth', { user: req.session.user, apiError: false });
});

app.post("/song-search-auth", function(req, res) {
    var str = req.body.lyrics;
    var json;

    // //console.log('https://api.audd.io/findLyrics/' + str);
    var data = {
        'q': str,
        'api_token': 'c97490b1565b179dac5082343c37cc00'
    };

    request({
        uri: 'https://api.audd.io/findLyrics/',
        form: data,
        method: 'POST'
    }, function(err, resi, body) {
        if (err) {
            res.render("searchByLyricsAuth", { user: req.session.user, apiError: true });
        };
        if (body) {
            var info = [];
            body = JSON.parse(body);
            json = body.result;
            // //console.log(json);

            function nl2br(str) {
                return str.replace(/(?:\r\n|\r|\n)/g, '<br> ');
            }


            // //console.log(json);
            for (var song = 0; song < json.length; song++) {

                var mediaLinks = { 'title_with_featured': "No Song Title", 'song_id': 'No Song ID', 'artist': 'No Artist', 'lyrics': 'No Lyrics Found :(', 'spotify': "No link sry", 'soundcloud': 'No link sry', 'apple_music': 'No link sry', 'youtube': 'No link sry' };

                // //console.log("hmmmmmmmmmmmmmmmmmmmmmmmmmmm");

                mediaLinks.song_id = json[song].song_id;

                if (json[song].title_with_featured != '') {
                    mediaLinks.title_with_featured = json[song].title_with_featured;
                }
                if (json[song].artist != '') {
                    mediaLinks.artist = json[song].artist;
                }
                if (json[song].lyrics != '') {
                    mediaLinks.lyrics = json[song].lyrics;
                }
                var parsedMedia = JSON.parse(json[song].media)
                // //console.log(parsedMedia);
                // //console.log(parsedMedia.length);
                for (var media = 0; media < parsedMedia.length; media++) {
                    // //console.log(parsedMedia);
                    // //console.log(parsedMedia[media].provider, parsedMedia[media].url, media);

                    if (parsedMedia[media].provider == "spotify") {
                        mediaLinks.spotify = parsedMedia[media].url;
                        //console.log(parsedMedia[media].url);
                    }
                    if (parsedMedia[media].provider == "soundcloud") {
                        mediaLinks.soundcloud = parsedMedia[media].url;
                    }
                    if (parsedMedia[media].provider == "apple_music" || parsedMedia[media].provider == "itunes") {
                        mediaLinks.apple_music = parsedMedia[media].url;
                    }
                    if (parsedMedia[media].provider == "youtube") {
                        mediaLinks.youtube = parsedMedia[media].url;
                    }
                }
                // //console.log(mediaLinks.youtube, "wfhiuewfhuewhfiuwhiufueiwfih");
                info.push(mediaLinks);
                // //console.log(info[song]);
                // //console.log(mediaLinks);
            }
            // //console.log(info);
            res.render("resultByLyricsAuth", { songs: info, user: req.session.user });
        }
    });
});

app.get('/song-search', isAuthLyricSearch, function(req, res) {
    res.render('searchByLyricsNotAuth', { apiError: false });
});

app.post("/song-search", function(req, res) {
    var str = req.body.lyrics;
    var json;

    // //console.log('https://api.audd.io/findLyrics/' + str);
    var data = {
        'q': str,
        'api_token': 'c97490b1565b179dac5082343c37cc00'
    };

    request({
        uri: 'https://api.audd.io/findLyrics/',
        form: data,
        method: 'POST'
    }, function(err, resi, body) {
        if (err) {
            res.render("searchByLyricsNotAuth", { apiError: true });
        };
        if (body) {
            var info = [];
            body = JSON.parse(body);
            //console.log(body);
            json = body.result;
            // //console.log(json);

            function nl2br(str) {
                return str.replace(/(?:\r\n|\r|\n)/g, '<br> ');
            }


            // //console.log(json);
            for (var song = 0; song < json.length; song++) {

                var mediaLinks = { 'title_with_featured': "No Song Title", 'song_id': 'No Song ID', 'artist': 'No Artist', 'lyrics': 'No Lyrics Found :(', 'spotify': "No link sry", 'soundcloud': 'No link sry', 'apple_music': 'No link sry', 'youtube': 'No link sry' };

                // //console.log("hmmmmmmmmmmmmmmmmmmmmmmmmmmm");

                mediaLinks.song_id = json[song].song_id;

                if (json[song].title_with_featured != '') {
                    mediaLinks.title_with_featured = json[song].title_with_featured;
                }
                if (json[song].artist != '') {
                    mediaLinks.artist = json[song].artist;
                }
                if (json[song].lyrics != '') {
                    mediaLinks.lyrics = json[song].lyrics;
                }
                var parsedMedia = JSON.parse(json[song].media)
                // //console.log(parsedMedia);
                // //console.log(parsedMedia.length);
                for (var media = 0; media < parsedMedia.length; media++) {
                    // //console.log(parsedMedia);
                    // //console.log(parsedMedia[media].provider, parsedMedia[media].url, media);

                    if (parsedMedia[media].provider == "spotify") {
                        mediaLinks.spotify = parsedMedia[media].url;
                        //console.log(parsedMedia[media].url);
                    }
                    if (parsedMedia[media].provider == "soundcloud") {
                        mediaLinks.soundcloud = parsedMedia[media].url;
                    }
                    if (parsedMedia[media].provider == "apple_music" || parsedMedia[media].provider == "itunes") {
                        mediaLinks.apple_music = parsedMedia[media].url;
                    }
                    if (parsedMedia[media].provider == "youtube") {
                        mediaLinks.youtube = parsedMedia[media].url;
                    }
                }
                // //console.log(mediaLinks.youtube, "wfhiuewfhuewhfiuwhiufueiwfih");
                info.push(mediaLinks);
                // //console.log(info[song]);
                // //console.log(mediaLinks);
            }
            // //console.log(info);
            res.render("resultByLyricsNotAuth", { songs: info });
        }
    });
});


app.get('/lyrical-search-auth', function(req, res) {
    res.render('searchLyricsAuth', { user: req.session.user, apiError: false });
});

app.post("/lyrical-search-auth", function(req, res) {
    var title = req.body.title;
    var artist = req.body.artist;
    var str = artist + " " + title;
    var json;

    // //console.log('https://api.audd.io/findLyrics/' + str);
    var data = {
        'q': str,
        'api_token': 'c97490b1565b179dac5082343c37cc00'
    };

    request({
        uri: 'https://api.audd.io/findLyrics/',
        form: data,
        method: 'POST'
    }, function(err, resi, body) {
        if (err) {
            res.render('searchLyricsAuth', { user: req.session.user, apiError: true });
        };
        if (body) {
            var info = [];
            body = JSON.parse(body);
            json = body.result;
            // //console.log(json);

            function nl2br(str) {
                return str.replace(/(?:\r\n|\r|\n)/g, '<br> ');
            }


            // //console.log(json);
            for (var song = 0; song < json.length; song++) {

                var mediaLinks = { 'title_with_featured': "No Song Title", 'song_id': 'No Song ID', 'artist': 'No Artist', 'lyrics': 'No Lyrics Found :(', 'spotify': "No link sry", 'soundcloud': 'No link sry', 'apple_music': 'No link sry', 'youtube': 'No link sry' };

                // //console.log("hmmmmmmmmmmmmmmmmmmmmmmmmmmm");

                mediaLinks.song_id = json[song].song_id;

                if (json[song].title_with_featured != '') {
                    mediaLinks.title_with_featured = json[song].title_with_featured;
                }
                if (json[song].artist != '') {
                    mediaLinks.artist = json[song].artist;
                }
                if (json[song].lyrics != '') {
                    mediaLinks.lyrics = json[song].lyrics;
                }
                var parsedMedia = JSON.parse(json[song].media)
                // //console.log(parsedMedia);
                // //console.log(parsedMedia.length);
                for (var media = 0; media < parsedMedia.length; media++) {
                    // //console.log(parsedMedia);
                    // //console.log(parsedMedia[media].provider, parsedMedia[media].url, media);

                    if (parsedMedia[media].provider == "spotify") {
                        mediaLinks.spotify = parsedMedia[media].url;
                        //console.log(parsedMedia[media].url);
                    }
                    if (parsedMedia[media].provider == "soundcloud") {
                        mediaLinks.soundcloud = parsedMedia[media].url;
                    }
                    if (parsedMedia[media].provider == "apple_music" || parsedMedia[media].provider == "itunes") {
                        mediaLinks.apple_music = parsedMedia[media].url;
                    }
                    if (parsedMedia[media].provider == "youtube") {
                        mediaLinks.youtube = parsedMedia[media].url;
                    }
                }
                // //console.log(mediaLinks.youtube, "wfhiuewfhuewhfiuwhiufueiwfih");
                info.push(mediaLinks);
                // //console.log(info[song]);
                // //console.log(mediaLinks);
            }
            // //console.log(info);
            res.render("resultLyricsAuth", { songs: info, user: req.session.user });
        }
    });


    //api call for lyric ssearch

});


app.get('/lyrical-search', function(req, res) {
    res.render('searchLyricsNotAuth', { apiError: false });
});

app.post("/lyrical-search", function(req, res) {
    var title = req.body.title;
    var artist = req.body.artist;
    var str = artist + " " + title;
    var json;

    // //console.log('https://api.audd.io/findLyrics/' + str);
    var data = {
        'q': str,
        'api_token': 'c97490b1565b179dac5082343c37cc00'
    };

    request({
        uri: 'https://api.audd.io/findLyrics/',
        form: data,
        method: 'POST'
    }, function(err, resi, body) {
        if (err) {
            res.render('searchLyricsNotAuth', { apiError: true });
        };
        if (body) {
            var info = [];
            body = JSON.parse(body);
            json = body.result;
            // //console.log(json);

            function nl2br(str) {
                return str.replace(/(?:\r\n|\r|\n)/g, '<br> ');
            }


            // //console.log(json);
            for (var song = 0; song < json.length; song++) {

                var mediaLinks = { 'title_with_featured': "No Song Title", 'song_id': 'No Song ID', 'artist': 'No Artist', 'lyrics': 'No Lyrics Found :(', 'spotify': "No link sry", 'soundcloud': 'No link sry', 'apple_music': 'No link sry', 'youtube': 'No link sry' };

                // //console.log("hmmmmmmmmmmmmmmmmmmmmmmmmmmm");

                mediaLinks.song_id = json[song].song_id;

                if (json[song].title_with_featured != '') {
                    mediaLinks.title_with_featured = json[song].title_with_featured;
                }
                if (json[song].artist != '') {
                    mediaLinks.artist = json[song].artist;
                }
                if (json[song].lyrics != '') {
                    mediaLinks.lyrics = json[song].lyrics;
                }
                var parsedMedia = JSON.parse(json[song].media)
                // //console.log(parsedMedia);
                // //console.log(parsedMedia.length);
                for (var media = 0; media < parsedMedia.length; media++) {
                    // //console.log(parsedMedia);
                    // //console.log(parsedMedia[media].provider, parsedMedia[media].url, media);

                    if (parsedMedia[media].provider == "spotify") {
                        mediaLinks.spotify = parsedMedia[media].url;
                        // //console.log(parsedMedia[media].url);
                    }
                    if (parsedMedia[media].provider == "soundcloud") {
                        mediaLinks.soundcloud = parsedMedia[media].url;
                    }
                    if (parsedMedia[media].provider == "apple_music" || parsedMedia[media].provider == "itunes") {
                        mediaLinks.apple_music = parsedMedia[media].url;
                    }
                    if (parsedMedia[media].provider == "youtube") {
                        mediaLinks.youtube = parsedMedia[media].url;
                    }
                }
                // //console.log(mediaLinks.youtube, "wfhiuewfhuewhfiuwhiufueiwfih");
                info.push(mediaLinks);
                // //console.log(info[song]);
                // //console.log(mediaLinks);
            }
            // //console.log(info);
            res.render("resultLyricsNotAuth", { songs: info });
        }
    });


    //api call for lyric ssearch

});

/* Login Routes */
app.get('/login', isLoggedIn, function(req, res) {
    res.render('login', { error: false });
});

app.post('/login', async function(req, res) {
    let isUserExist = await checkUsername(req.body.username);
    let hashedPasswd = isUserExist.length > 0 ? isUserExist[0].password : '';
    let passwordMatch = await checkPassword(req.body.password, hashedPasswd);
    if (passwordMatch) {
        req.session.authenticated = true;
        req.session.user = isUserExist[0].username;
        // //console.log(await returnUserId(isUserExist[0].username));
        res.redirect('/');


    }
    else {
        res.render('login', { error: true });
    }
});

/* Register Routes */
app.get('/signup', isLoggedIn, function(req, res) {
    res.render('signup', { error: false });
});

app.post('/signup', function(req, res) {
    let salt = 10;









    //username already taken sry!!!!!!!!!





    let userNameStmt = 'Select userId from users where username=?';
    connection.query(userNameStmt, [req.body.username], function(error, results) {
        if (error) throw error;
        //console.log(results);
        if (results.length != 0) {
            res.render('signup', { error: true });
        }
        else {
            bcrypt.hash(req.body.password, salt, function(error, hash) {
                if (error) throw error;
                let stmt = 'INSERT INTO users (username, password) VALUES (?, ?)';
                let data = [req.body.username, hash];
                connection.query(stmt, data, function(error, result) {
                    if (error) throw error;
                    res.redirect('/login');
                });
            });
        }

    });



});

/* Logout Route */
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});


/* Upload Routes */
app.get('/upload', isAuthenticated, function(req, res) {
    let stmt = 'SELECT title, artist, spotify, apple_music, deezer, songId FROM songs, users where songs.username=users.username and users.username=?';
    connection.query(stmt, [req.session.user], function(error, result) {
        if (error) throw error;
        //console.log(result, req.session.user)
        res.render('upload', { songs: result, user: req.session.user, apiError: false });
    });
});

app.post('/upload', upload.single('filename'), function(req, res) {
    //console.log('File uploaded locally at ', req.file.path);
    var filename = req.file.path.split('/').pop();
    var content = fs.readFileSync(req.file.path);
    var data = new Buffer(content);
    let bin = new Buffer(data, 'binary');
    let b64 = bin.toString('base64')

    var stmt = 'INSERT INTO files (filename, data) VALUES (?,?);';
    connection.query(stmt, [filename, b64], function(err, result) {
        if (err) console.log(err);
        // res.redirect('/');
    });
    //console.log("\n", filename, "\n");

    var json;

    var queryStmt = 'SELECT * FROM files WHERE filename=?';
    connection.query(queryStmt, [filename], function(error, results) {
        if (error) throw error;
        if (results.length) {
            let file = results[0];
            // let data = new Buffer(file.data, 'binary');
            // let b64 = data.toString('base64')
            // var request = require("request");

            var apiData = {
                // 'file': fs.createReadStream('/FileUpload/Project/public/file/' + req.params.id + ".mp3"),
                'audio': file.data,
                // 'return': 'timecode,song_link',
                'return': 'apple_music,spotify,deezer',
                // 'return': 'timecode,song_link,apple_music,spotify,deezer',
                'api_token': 'c97490b1565b179dac5082343c37cc00'
            };

            request({
                uri: 'https://api.audd.io/',
                formData: apiData,
                method: 'POST'
            }, function(err, resi, body) {
                if (err) {
                    let errorStmt = 'SELECT title, artist, spotify, apple_music, deezer, songId FROM songs, users where songs.username=users.username and users.username=?';
                    connection.query(errorStmt, [req.session.user], function(errory, result) {
                        if (errory) throw errory;
                        //console.log(result, req.session.user)
                        res.render('upload', { songs: result, user: req.session.user, apiError: true });
                    });
                }
                if (body) {
                    json = JSON.parse(body)
                    //console.log(json.result);
                    //console.log("\n");
                    var songinfo = [req.session.user, json.result.artist, json.result.title, "No link sry", "No link sry", "No link sry"];
                    if (['spotify'] in json.result) {
                        songinfo[3] = json.result.spotify.external_urls.spotify;
                        //console.log("spotify ", json.result.spotify.external_urls.spotify);
                    }

                    //console.log("\n");
                    if (['apple_music'] in json.result) {
                        //console.log("apple_music ", json.result.apple_music.url);
                        songinfo[4] = json.result.apple_music.url;
                        // //console.log("spotify ", json.result.spotify.external_urls.spotify);
                    }

                    //console.log("\n");
                    if (['deezer'] in json.result) {
                        // //console.log("spotify ", json.result.spotify.external_urls.spotify);
                        songinfo[5] = json.result.deezer.link;
                        //console.log("Deezer ", json.result.deezer.link);
                    }
                    // //console.log("spotify ", json.result.spotify.external_urls.spotify);
                    //console.log("\n");
                    //console.log("Hello, over here\n");
                    //console.log(songinfo);
                    var insertStmt = 'INSERT INTO songs (username, artist, title, spotify, apple_music, deezer) VALUES (?,?,?,?,?,?);';
                    connection.query(insertStmt, songinfo, function(error, results) {


                        res.redirect("/upload");



                    });
                    // //console.log(body);
                    // //console.log(res);
                    // //console.log(JSON.parse(JSON.stringify(body)););
                    // return body;
                }
                // //console.log(json);

            });
        }

    });
});

app.post('/updateSong', isAuthenticated, function(req, res) {
    let stmt = 'UPDATE songs SET title=?, artist=? WHERE songId=?';
    connection.query(stmt, [req.body.title, req.body.artist, req.body.songId], function(error, results) {
        if (error) throw error;
        if (results.length) {
            //console.log(results);
            res.redirect('/upload')
        }
    });
});

app.post('/deleteSong', function(req, res) {
    let stmt = 'DELETE FROM songs WHERE songId=?';
    connection.query(stmt, [req.body.songId], function(error, results) {
        if (error) throw error;
        if (results.length) {
            res.redirect('/upload')
        }
    });
});


/* Error Route*/
app.get('*', function(req, res) {
    res.render('error');
});

app.listen(process.env.PORT || 3000, function() {
    //console.log('Server has been started');
})
