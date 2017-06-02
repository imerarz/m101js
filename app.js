var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    bodyParser = require('body-parser'),
    assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true })); 

function validateMovie(movie){
  if (movie.title === undefined || movie.imdb === undefined || movie.year === undefined)
    return false;
  
  if (movie.title === '' || movie.imdb === '' || movie.year === '')
    return false;

  return true;
}

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    app.get('/movies', function(req, res){
        res.render('movie');
    });

    app.post('/movies', function(req, res){
        var movie = {
          title: req.body.title,
          year: req.body.year,
          imdb: req.body.imdb
        };
        console.log(movie);
        if (validateMovie(movie) === true){
          db.collection('movies').insertOne(movie, function(err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
          });
        }
        res.redirect('/');
    });
    
    app.get('/', function(req, res){

        db.collection('movies').find({}).toArray(function(err, docs) {
            res.render('movies', { 'movies': docs } );
        });

    });

    app.use(function(req, res){
        res.sendStatus(404);
    });
    
    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});
