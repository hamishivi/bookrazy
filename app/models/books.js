'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
    name: String,
    image: String,
    creator: String,
    wanter: String
});

module.exports = mongoose.model('Book', Book);