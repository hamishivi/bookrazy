'use strict';

var path = process.cwd();
var Book = require('../models/books');
var User = require('../models/users');
var mongoose = require('mongoose');

module.exports = function (app) {

    function requireLogin (req, res, next) {
        if (!req.user) {
            res.redirect('/login');
        } else {
            next();
        }
    };
    
    app.set('view engine', 'ejs');
    
    // needs users and books
    app.get('/', function (req, res) {
        res.locals.user = true;
        res.locals.books = [];
        // how to retrieve accounts in stormpath
        /*application.getAccounts({ username: 'tk421' }, function(err, accounts) {
            accounts.each(function(account, callback) {
            console.log('Account:', account);
            res.locals.user = true;
            callback();
        }, function(err) {
            console.log('Finished iterating over accounts.');
        });
        });*/
        res.render(path + '/public/index.ejs');
    });

    app.get('/logout', function(req, res) {
        req.session.reset();
        res.redirect('/');
    });
    
    app.get('/signup', function(req, res) {
        // how to create userin stormpath
        var account = {
            givenName: 'Joe',
            surname: 'Stormtrooper',
            username: 'tk421',
            email: 'tk421@stormpath.com',
            password: 'Changeme1',
            customData: {
                favoriteColor: 'white'
            }
        };

        application.createAccount(account, function(err, createdAccount) {
            if (err) return err
            console.log('Account:', createdAccount);
        });
    });
    
    app.get('/auth', function(req,res) {
        // authorise request for account
        var authRequest = {
            username: 'tk421',
            password: 'Changeme1'
        };

        application.authenticateAccount(authRequest, function(err, result) {
             // If successful, the authentication result will have a method,
             // getAccount(), for getting the authenticated account.
            result.getAccount(function(err, account) {
            console.log('Account:', account);
        });
        });
    });

}