'use strict';

var express = require('express'),
    routes = require('./app/routes/index.js'),
    mongoose = require('mongoose'),
    User = require('./app/models/users.js'),
    session = require('client-sessions'),
    stormpath = require('express-stormpath');

var app = express();
require('dotenv').load();


//mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));


app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

app.use(stormpath.init(app, {
  // Optional configuration options.
}));

app.set('view engine', 'ejs')

app.on('stormpath.ready', function () {
  console.log('Stormpath Ready!');
});

routes(app);

var port = process.env.PORT || 8080;
app.listen(port, function () {
   console.log('Node.js listening on port ' + port + '...');
});