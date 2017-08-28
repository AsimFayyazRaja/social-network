var express=require('express');
var app=express();
var MongoClient=require('mongodb').MongoClient;
var bodyParser=require('body-parser');
app.use(express.static('public'));
var bcrypt=require('bcrypt');
var jwt=require('jwt-simple');
var ObjectId=require('mongodb').ObjectId;
var index=require('./server/routes/index');
var users=require('./server/routes/users');
var chat=require('./server/routes/chat');
var mongo=require('mongodb');
var mongoose=require('mongoose');
var Chats=require('./server/models/chat');         //chat model

var secret='blekh';
var path=require('path');
//var session = require('express-session');
//app.use(session({secret: "huihui", resave: false, saveUninitialized: true}));
var feed=require('./server/routes/feed');
var cookieSession = require('cookie-session');

var server = app.listen(3000,function(){
    console.log("Server is running");
});



var promise=require('Promise');

var db=null;

MongoClient.connect('mongodb://localhost:27017/fb',function(err,dbconn){
if(!err)
{
    console.log("Connected to fb DB");
    db=dbconn;
}
});

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin,X-Requested-With, Content-Type,Accept,Authorization,sid*");
    res.header("Access-Control-Allow-Methods"," POST, GET, OPTIONS, DELETE, PUT");
next();
});

app.use(express.static('public'));

app.use(cookieSession({
  name: 'session',
  keys: ["huihui"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.json());

var client= "./client";
var url='mongodb://localhost:27017/fb';


var http=require('http');

var io = require('./server/routes/socket').listen(server);         //will do chat scene in here


var findChat=function(user1,user2){
    return new Promise(function(resolve,reject){
        Chats.findOne({$or:[{"user1":user1,"user2":user2},
                     {"user2":user1,"user1":user2}]},function(err,docs){
                        if(err) throw(err);
                        if(docs)
                        {
                            resolve(docs);
                        }
                        else{
                            reject(docs);;
                        }
});
    });
}; 

var updateChat=function(id,newchat,chat){
    return new Promise(function(resolve,reject){
        mongo.connect(url,function(err,db){
        db.collection('chats',function(err,chatCollec){
        chatCollec.removeOne({_id:ObjectId(id)},function(err){       //delete old chat doc
                        if(err) reject(err);
                        console.log("deleted");                 //push message 
                        chat.messages.push(newchat);
                        resolve(chat);
        });
    });
});
    });
}; 

var addChat=function(newchat,user1,user2){
    return new Promise(function(resolve,reject){
        mongo.connect(url,function(err,db){
        db.collection('chats',function(err,chatCollec){
        chatCollec.insertOne(newchat,function(err,docs){       //delete old chat doc
                        if(err) reject(err);
                        console.log("added chat to db");                 //push message 
                        //resolve(docs._id);
    db.collection('chats',function(err,chatCollec){
        chatCollec.findOne({$or:[{"user1":user1,"user2":user2},
                     {"user2":user1,"user1":user2}]},function(err,docs){
                        if(err) reject(err);
                        resolve(docs);
        });
    });                        
        });
    });
});
    });
}; 


app.post('/getchat',function(req,res,next){
    console.log(req.body.data);
    findChat(req.body.data.user1,req.body.data.user2).then(function(result){
    console.log(result);
    res.send(result);
});
});


io.on('connection',function(socket){
        console.log("socket io running in appjs");
        socket.on("message",function(data){
            var newchat={                       //msg text, date and sender stored in an object
                msg:data.msg,
                date: new Date(),
                sent_by: data.user1
            };
         var unread_messages=[];
            
         findChat(data.user1,data.user2).then(function(result){
            console.log(result);
            return updateChat(result._id,newchat,result).then(function(result){
                console.log("updated chat", result);
                return addChat(result,data.user1,data.user2).then(function(result){
                    console.log(result);
                    io.emit("sendmessage",result);
                }).catch(function(err){
                    console.log(err);
                })
            }).catch(function(err){
                console.log(err);
            })
         }).catch(function(docs){
            var chat={
                user1: data.user1,
                user2: data.user2,
                messages: newchat
            };
            addChat(chat,data.user1,data.user2).then(function(result){
                console.log(result);
                io.emit("sendmessage",result);
            })
         });
});
});

var cons = require('consolidate');

var rt='./client';

// view engine setup
app.engine('html', cons.swig);
app.set('views', path.join(__dirname, rt));
app.set('view engine', 'html');



app.use('/',index);
app.use('/users',users);        //handling timeline routes specific to a single user
app.use('/feed', feed);         //controlling newsfeed related routes




app.use('/newsfeed',function(req,res,next){         //red to newsfeed
res.sendFile('/newsfeed.html',{root: client});
});

app.use('/profile',function(req,res,next){         //red to profile
res.sendFile('/profile.html',{root: client});
});


//will add authentication that only logged in user can make this request

app.use('/home',function(req,res,next){             //redirecting to home
res.sendFile('/home.html',{root: client});
});


app.use('/chat',function(req,res,next){             //redirecting to chat
res.sendFile('/chat.html',{root: client});
});


/*var client="../client";
app.use('*',function(req,res,next){
    res.sendFile('/begin.html',{ root: client });
});
*/

module.exports={app: app, server:server};