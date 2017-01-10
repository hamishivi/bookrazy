'use strict';

var path = process.cwd();
var Book = require('../models/books');
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
        Book.find({}, function(err, data) {
            if (err) return err;
            res.locals.books = data;
             res.render(path + '/public/index.ejs');
        });
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
    
    app.get('/dashboard', stormpath.getUser, requireLogin, function(req, res) {
        res.locals.user = req.user;
        Book.find({'creator': req.user.email}, function(err, data) {
            if (err) return err;
            res.locals.books = data;
            console.log(data);
            res.render(path + '/public/dashboard.ejs');
        });
        
    });
    
    app.get('/addBook', stormpath.getUser, requireLogin, function(req, res) {
        res.locals.user = req.user;
        res.render(path + '/public/addBook.ejs');
    });
    
    app.post('/api/addbook', stormpath.getUser, requireLogin, function(req, res) {
        console.log(req.body);
        var newBook = new Book();
        newBook.name = req.body.book;
        newBook.image = req.body.image;
        newBook.creator = req.user.username;
        newBook.save(function(err) {
            if (err) return err;
            // add some kind of success message?
            res.redirect('/');
        });
    });
    
    app.get('/trade/:bookid/', stormpath.getUser, requireLogin, function(req, res) {
        Book.findById(req.params.bookid, function(err, book) {
            if (err) console.log(err);
            // need to add book to pending trades of user who owns it
            app.get('stormpathApplication').getAccounts( { username: 'blah' }, function(err, accounts) { 
                if (err) return err;
                accounts.each(function(account, cb) {
                    
                });
            });
        });
    });
    
    app.get('/delete/:bookid', stormpath.getUser, requireLogin, function(req, res) {
        
    })

    app.get('/delete/:bookid/', stormpath.getUser, requireLogin, function(req, res) {
        Book.findOneAndRemove({"_id":req.params.bookid, "creator": req.user.email}, function(err, data) {
            if (err) return err;
            // again add success message? its pretty fast and clear what happens...
            res.redirect('/dashboard');
        })
    });

    app.get('/logout', function(req, res) {
        req.session.reset();
        res.redirect('/');
    });

}

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};