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
        var username = "";
        if (req.user) {
            username = req.user.username;
        }
        Book.find({creator: {$ne : username}}, function(err, data) {
            if (err) return err;
            res.locals.books = data;
            res.render(path + '/public/index.ejs');
        });
    });
    
    app.get('/help', stormpath.getUser, function(req, res) {
        res.locals.user = req.user;
        res.render(path + '/public/help.ejs');
    })
    
     app.get('/profile', stormpath.getUser, requireLogin, function (req, res) {
        res.locals.user = req.user;
        //console.log(req.user);
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
            //console.log(req.user)
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
            res.render(path + '/public/dashboard.ejs');
        });
        
    });
    
    app.get('/addBook', stormpath.getUser, requireLogin, function(req, res) {
        res.locals.user = req.user;
        res.render(path + '/public/addBook.ejs');
    });
    
    app.post('/api/addbook', stormpath.getUser, requireLogin, function(req, res) {
        //console.log(req.body);
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
            if (book == null) { 
                console.log("Book was null when trading. please check me!!");
                res.redirect('/');
                return;
            }
            // need to add book to pending trades of user who owns it
            app.get('stormpathApplication').getAccounts( { username: book.creator }, function(err, accounts) { 
                if (err) return err;
                accounts.each(function(account, cb) {
                    account.getCustomData(function(err, customData) {
                        if (err) return err;
                        if (!customData.pendingTrades) {
                            customData.pendingTrades = [];
                        }
                        book.wanter = req.user.username;
                        //console.log(book)
                        customData.pendingTrades.push(book);
                        book.remove();
                        customData.save(function(err){
                            if (err) return err;
                            // add some kind of success message?
                            res.redirect("/");
                        });
                    });
                });
            });
        });
    });
    
    app.get('/stopTrade/:bookid', stormpath.getUser, requireLogin, function(req, res) {
        var trades = req.user.customData.pendingTrades;
        for (var i = 0; i < trades.length; i++) {
            if (trades[i]._id == req.params.bookid) {
                var newBook = new Book();
                newBook.name = trades[i].name;
                newBook.image = trades[i].image;
                newBook.creator = trades[i].creator;
                newBook.save(function(err) {
                    if (err) return err;
                });
                req.user.customData.pendingTrades.splice(i, 1);
                req.user.customData.save();
                res.redirect('/dashboard');
            }
        }
    });
    
    app.get('/accept/:bookid', stormpath.getUser, requireLogin, function(req, res) {
        var trades = req.user.customData.pendingTrades;
        for (var i = 0; i < trades.length; i++) {
            var book = trades[i];
            if (book._id == req.params.bookid) {
                res.locals.email = book.wanter;
                res.locals.id = book._id;
                app.get('stormpathApplication').getAccounts( { username: book.wanter }, function(err, accounts) { 
                    if (err) return err;
                    accounts.each(function(account, cb) {
                        account.getCustomData(function(err, customData) {
                            if (err) return err;
                            if (!customData.receiving) {
                                customData.receiving = [];
                            }
                            customData.receiving.push(book);
                            req.user.customData.pendingTrades.splice(trades.indexOf(book), 1); //remove book from pending trades and place in recieving
                            req.user.customData.save();
                            customData.save(function(err){
                                if (err) return err;
                                // accept and send email
                                res.render(path + "/public/accept.ejs");
                            });
                        });
                    });
                });
            }
        }
    });
    
    app.get('/cancelTrade/:bookid/:email', stormpath.getUser, requireLogin, function(req, res) {
        app.get('stormpathApplication').getAccounts( { username: req.params.email }, function(err, accounts) { 
            if (err) return err;
            accounts.each(function(account, cb) {
                account.getCustomData(function(err, customData) {
                    if (err) return err;
                    var rec = customData.receiving;
                    for (var i = 0; i < rec.length; i++) {
                        if (rec[i]._id == req.params.bookid) {
                            var newBook = new Book();
                            newBook.creator = req.user.username;
                            newBook.image = rec[i].image;
                            newBook.name = rec[i].name;
                            newBook.save(function(err) {
                                if (err) return err;
                            });
                            customData.receiving.splice(i, 1);
                            customData.save();
                        }
                        res.redirect('/dashboard');
                    }
                });
            });
        });
    });
    
    // book gets swapped to new owner
    app.get('/received/:bookid', stormpath.getUser, requireLogin, function(req, res) {
        for (var i = 0; i < req.user.customData.receiving.length; i++) {
            if (req.user.customData.receiving[i]._id == req.params.bookid) {
                console.log(req.user.customData.receiving[i])
                var addBook = new Book();
                addBook.name = req.user.customData.receiving[i].name;
                addBook.image = req.user.customData.receiving[i].image;
                addBook.creator = req.user.username;
                req.user.customData.receiving.splice(i, 1);
                req.user.customData.save();
                addBook.save(function(err) {
                    if (err) return err;
                    res.redirect('/')
                });
            }
        }
    });
    
    // book goes back to its original owner
    app.get('/denied/:bookid', stormpath.getUser, requireLogin, function(req, res) {
        for (var i = 0; i < req.user.customData.receiving.length; i++) {
            if (req.user.customData.receiving[i]._id == req.params.bookid) {
                var addBook = new Book();
                addBook.name = req.user.customData.receiving[i].name;
                addBook.image = req.user.customData.receiving[i].image;
                addBook.creator = req.user.customData.receiving[i].creator;
                req.user.customData.receiving.splice(i, 1);
                req.user.customData.save();
                addBook.save(function(err) {
                    if (err) return err;
                    res.redirect('/');
                });
                
            }
        }
    });

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