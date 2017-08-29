// get all required items
var express = require('express');
var engines = require('consolidate');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var assert = require('assert');
var logger = require('morgan');
var path = require('path');
// var favicon = require('serve-favicon');
var port = process.env.PORT || 8080;
var mongoUri = process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        process.env.MONGODB_URI ||
        'mongodb://localhost/ureca';
var GOOGLE_MAP_API = 'AIzaSyCUH4ybclQQPb9WiYYoY1gMLNyq3WaUQ1E';
var ntu = require('./data/ntu.json');
var australia = require('./data/australia.json');

var app = express();


// configure our server
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));




// make sure we can connect to database before starting server
MongoClient.connect(mongoUri, function(err, db) {

    assert.equal(null, err);
    console.log('Successfully connected to mongodb');

    app.get('/', function(req, res) {
        res.render('index');
    });
    app.get('/coordinates/ntu/', function(req, res) {
        if (app.get('env') === 'development') {
            db.collection('ntu').aggregate([
                {
                    $project: {
                        _id: 0,
                        name: '$name',
                        lat: '$raw_data.location.lat',
                        lng: '$raw_data.location.lng'
                    }
                }
            ]).toArray(function(err, docs) {
                res.json(docs);
            })
        } else {
            res.send(ntu);
        }
    });
    app.get('/coordinates/australia/', function(req, res) {
        if (app.get('env') === 'development') {
            db.collection('australia').aggregate([
                {
                    $project: {
                        _id: 0,
                        name: '$name',
                        lat: '$raw_data.location.lat',
                        lng: '$raw_data.location.lng'
                    }
                }
            ]).toArray(function(err, docs) {
                res.json(docs);
            })
        } else {
            res.send(australia);
        }
    });

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });



    app.listen(port, function() {
        console.log('Server listening on port 8080');
    });

});
