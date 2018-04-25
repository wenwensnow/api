var express = require('express'),
    http = require('http'),
    path = require('path'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'), // used to create, sign, and verify tokens,
    config = require('./config/config') // get our config file

var app = express()

app.set('port', process.env.PORT || 3000)
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable
app.use(morgan('dev')) //logger
app.use(bodyParser.urlencoded({extended: true})) //immplements http POST
app.use(bodyParser.json())
app.use(methodOverride('X-HTTP-Method-Override')) //Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it

//Auto add API controllers
fs.readdirSync(__dirname + '/api/controllers').forEach((name) => {
    require(__dirname + '/api/controllers/' + name)(app)
})

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port)
})
