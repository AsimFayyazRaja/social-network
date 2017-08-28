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
var Requests=require('../models/requests');
var Friends=require('../models/friends');
var Comments=require('../models/comments');
apps.use(session({secret: "huihui", resave: false, saveUninitialized: true}));
var url='mongodb://localhost:27017/fb';
var fs=require('fs');

router.put('/profile',function(req,res,next){
    var client="../client";
    console.log("getting profile");
    res.sendFile('/profile.html',{ root: client });  
});

router.post('/unfriend',function(req,res,next){                         //make this query correct
    mongo.connect(url,function(err,db){
        db.collection('friends',function(err,friendCollec){
        friendCollec.removeOne({user1: req.body.user, user2: req.session.user},function(err){
                    if(err) throw(err);
                });
                friendCollec.removeOne({user2: req.body.user, user1: req.session.user},function(err){
                    if(err) throw(err);
                    res.send("Unfriended");
                    });
        });
    });
});


friendsofuser=function(user)
{
    return new Promise(function(resolve,reject){
        mongo.connect(url, function(err,db){                 
        if(err) throw(err);
        db.collection('friends',function(err,friendsCollec){
        if(err) throw(err);
            console.log("in promise of friendsofuser");
            friendsCollec.find({$or:[{"user1":user},{"user2":user}]})
            .toArray(function(err,docs){
                if(err) reject(err);
                resolve(docs);
            });
        });
        });
    });
    
};


allusers=function(){
    return new Promise(function(resolve,reject){
        console.log("In the promise of all users");
        mongo.connect(url, function(err,db){                 
        if(err) throw(err);
        db.collection('users',function(err,usersCollec){
        usersCollec.find({}).toArray(function(err,users){
        if(err) reject(err);
        resolve(users);
        
    });
    
});   
    });
    });
};

getfriends=function(req,res,next,user,data){          
        var friends,users;                       
        friendsofuser(user).then(function(result){
            friends=result;
            return allusers();
        }).catch(function(err){
            console.log(err);
        }).then(function(result){
            users=result;
            for(var i=0;i<users.length;i++)
                {
                    for(var j=0;j<friends.length;j++)
                    {
                        if(friends[j].user1==users[i].username){
                            if(friends[j].user1!=req.body.user){
                                data.push(users[i]);
                            }
                        }
                        else if(friends[j].user2==users[i].username){
                            if(friends[j].user2!=req.body.user){
                                data.push(users[i]);
                            }
                        }
                    }
                }
                console.log("data to return: ",data);
                res.send(data);
        }).catch(function(err){
            console.log(err);
        });               
};


router.post('/getfriends',function(req,res,next){           //getting friends collec and seeing
   var data=[];
   getfriends(req,res,next,req.session.user,data);
});



findFriend= function(req,res,next){
    return new Promise(function(resolve,reject){
    mongo.connect(url, function(err,db){
    if(err) throw(err);
    db.collection('friends',function(err,friendsCollec){
    if(err) throw(err);
    console.log(req.session.user);
    friendsCollec.find( { $or: [ { "user1": req.session.user}, { "user2": req.session.user } ] } ).toArray(function(err,doc){
    //console.log("doc: ",doc);
    if(err) reject(err);
    resolve(doc);
        });
    });
});
    });
};

findUsers=function(req,res,next){
   return new Promise(function(resolve,reject){ 
    mongo.connect(url, function(err,db){
        if(err) throw(err);
        db.collection('users',function(err,usersCollec){
            if(err) throw(err);
            usersCollec.find({}).toArray(function(err,docs){
                if(err) reject(err);
                for(var i=0;i<docs.length;i++)
                {
                    if(docs[i].username==req.session.user)
                    {
                        docs.splice(i,1);
                    }
                }
                resolve(docs);
                });
        });
    });
   });
};

router.get('/getusers',function(req,res,next){      //getting users to be added for current user
    var users;                                      //execpt his friends and him
    //console.log("Getting users");
    findUsers(req,res,next).then(function(result){
    //console.log(result);
    users=result;
    return findFriend(req,res,next);    
}).then(function(result){
//console.log(result);
//console.log(users);

var s=users.length;
for(var i=0;i<s;i++)
{
    for(var j=0;j<result.length;j++)
    {
        if(users[i]!=null)
        {
            //console.log(users[i].username, result[j].user1, result[j].user2);
            if(users[i].username==result[j].user1 || users[i].username==result[j].user2)
            {
                //console.log("NAME: ",users[i].username);
                users.splice(i,1);
                i--;
                break;
            }
        }
    }
}
//console.log(users);
res.send(users);
}).catch(function(err){
        console.log(err);
    });
});




router.post('/sendrequest',function(req,res,next){        //send request to a user
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        db.collection('requests',function(err,requestCollec){
            if(err) throw(err);
            //console.log(req.body.data.user1);
            if(req.body.user.sent_by==req.session.user)
            {
                requestCollec.insertOne(req.body.user,{w:1},function(err,docs){
                if(err) throw(err);
                //console.log("Friend added",docs);
                res.send();
            });
        }
        else{
            console.log("Error in adding friend");
            res.status(400).send();
        }
        });
    });
});

router.post('/add',function(req,res,next){      //current user accepting req
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        db.collection('requests',function(err,requestCollec){
            requestCollec.remove({sent_by: req.body.user, sent_to: req.session.user},function(err,docs){
                if(err) throw(err);
                console.log(docs);
                console.log("requests removed");
                //db.close();
                db.collection('friends',function(err,friendCollec){
                    var friend={
                        user1: req.body.user,
                        user2: req.session.user
                    };
                    friendCollec.insertOne(friend,{w:1},function(err,docs){
                        if(err) throw(err);
                        console.log("Friend added");
                        res.send();
                    });
            });
            });
});
    });
});

router.get('/requests',function(req,res,next){
    var requests=[];
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        db.collection('requests',function(err,requestCollec){
            if(err) throw(err);
            //console.log(req.body.data.user1);
                requestCollec.find({sent_to:req.session.user}).toArray(function(err,docs){
                if(err) throw(err);
                for(var i=0;i<docs.length;i++){
                    requests.push(docs[i].sent_by);
                }
                res.send(requests);
                console.log(requests);
});
        });
    });
});

router.post('/getrequests',function(req,res,next){
    var requests=[];
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        db.collection('requests',function(err,requestCollec){
            if(err) throw(err);
            //console.log(req.body.data.user1);
                requestCollec.find({sent_by:req.body.user}).toArray(function(err,docs){
                if(err) throw(err);
                for(var i=0;i<docs.length;i++){
                    requests.push(docs[i].sent_to);
                }
                res.send(requests);
            });  
        });
    });
});




























module.exports = router;