var express = require('express')
    , logger = require('morgan')
    , app = express()
    , mustacheExpress = require('mustache-express');

var Data = require('./data');

// Register '.mustache' extension with The Mustache Express
app.engine('mustache', mustacheExpress());

app.use(logger('dev'));
app.use(express.static(__dirname + '/static'));

// Register '.html' extension with The Mustache Express
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
// Register '.mustache' extension with The Mustache Express
app.engine('mustache', mustacheExpress());
app.set('views', __dirname + '/views');


app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.get('/', function (req, res) {
    res.render('index', Data.templateData());
});
app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
});
