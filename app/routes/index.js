'use strict';

var path = process.cwd();
var Book = require('../models/books');
var User = require('../models/users');
var mongoose = require('mongoose');
var stormpath = require('express-stormpath');

module.exports = function (app) {
    
    function requireLogin (req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/login');
        }
    };
    
    app.set('view engine', 'ejs');
    
    // needs users and books
    app.get('/', stormpath.getUser, function (req, res) {
        res.locals.user = req.user;
        res.locals.books = []; // lookup all books then render
        res.render(path + '/public/index.ejs');
    });

    app.get('/logout', function(req, res) {
        req.session.reset();
        res.redirect('/');
    });

}