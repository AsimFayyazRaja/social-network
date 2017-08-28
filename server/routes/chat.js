var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
mongoose.Promise = global.Promise;
var apps=express();
var jwt=require('jwt-simple');
var secret='blekh';
var bcrypt=require('bcrypt');
var mongo=require('mongodb')
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
apps.use(bodyParser.json());
var assert=require('assert');
var path = require('path');
var session = require('express-session');
var ObjectId=require('mongodb').ObjectId;
var promise=require('Promise');
var forEach = require('async-foreach').forEach;
var Users=require('../models/users');
var Posts=require('../models/posts');
var Comments=require('../models/comments');
apps.use(session({secret: "huihui", resave: false, saveUninitialized: true}));


module.exports=router;