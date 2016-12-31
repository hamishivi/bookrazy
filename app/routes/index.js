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
    
     app.get('/profile', stormpath.getUser, requireLogin, function (req, res) {
        res.locals.user = req.user;
        console.log(req.user);
        res.render(path + '/public/profile.ejs');
    });
    
    app.get('/addFullName/:name', stormpath.getUser, requireLogin, function(req, res) {
        req.user.customData.fullName = req.params.name;
        req.user.customData.save(function(err) {
            if (err) return err;
            res.redirect('/profile');
        });
    });
    
    app.get('/addCity/:city', stormpath.getUser, requireLogin, function(req, res) {
        req.user.customData.city = req.params.city;
        req.user.customData.save(function(err) {
            if (err) return err;
            console.log(req.user)
            res.redirect('/profile');
        });
    });
    
    app.get('/addState/:state', stormpath.getUser, requireLogin, function(req, res) {
        req.user.customData.state = req.params.state;
        req.user.customData.save(function(err) {
            if (err) return err;
            res.redirect('/profile');
        });
    });
    
    app.get('/dashboard', requireLogin, stormpath.getUser, function(req, res) {
        res.locals.user = req.user;
    });
    
    app.get('/addBook', requireLogin, stormpath.getUser, function(req, res) {
        
    });

    app.get('/logout', function(req, res) {
        req.session.reset();
        res.redirect('/');
    });

}