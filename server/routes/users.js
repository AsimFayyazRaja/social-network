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
var Dp=require('../models/dp');
var Comments=require('../models/comments');
apps.use(session({secret: "huihui", resave: false, saveUninitialized: true}));

var multer=require('multer');

var MJ = require("mongo-fast-join"),
mongoJoin = new MJ();

var url='mongodb://localhost:27017/fb';

router.get('/', function(req, res, next) {
    console.log("index");        
});

//------------------add like on post

findPost=function(id){
    return new Promise(function(resolve,reject){
        Posts.find({_id: ObjectId(id)},function(err,posts){  
            //console.log("in promise of findPost");
            if(posts==null){
                reject(err);
            }    
            else{
                resolve(posts);
            }
        });
    });
};

removePost=function(id){
    return new Promise(function(resolve,reject){
        Posts.remove({_id: ObjectId(id)},function(err){  
            //console.log("in promise of removePost");
            if(err){
                reject(err);
            }    
            else{
                resolve();
            }
        });
    });
};

addPost=function(postnew){
    return new Promise(function(resolve,reject){
        mongo.connect(url,function(err,db){
            db.collection('posts',function(err,meowsCollec){
                meowsCollec.insert(postnew,{w:1},function(err){
                    //console.log("in promise of addPost");
                    if(err){
                        reject(err);
                    }    
                    else{
                        resolve(postnew);
                    }
                });
            });
        });
    });
};

router.post('/addlike',function(req,res,next){      //remove post, add like or if already that user liked
    var postnew;var postit;                         //splice that like and repost the post in db
    mongo.connect(url,function(err,db){             //should use update instead of remove here
        var liked=null;                             //so that order of posts remain same
        if(err) throw(err);
        assert.equal(null,err);
        console.log(req.body.data.postid);
        findPost(req.body.data.postid).then(function(result){
            postnew=result;
            return removePost(req.body.data.postid);
        }).then(function(){
            var junk=0;
            for(var j=0;j<postnew[0].liked_by.length;j++)
            {
                if(postnew[0].liked_by[j]==req.body.data.username)
                {
                    junk=998;
                    postnew[0].liked_by.splice(j, 1);
                }
            }
            if(junk==0){
                postnew[0].liked_by.push(req.body.data.username);
            }
            return addPost(postnew);
            //console.log("liked_by of postnew: ",postnew[0].liked_by);
        }).then(function(posted){
            console.log("post added",posted);           //send response back
        });
    });
});


//----------------------------------------------------------------add like on the comment

addCommentId=function(cmnt){
    return new Promise(function(resolve,reject){
        mongo.connect(url,function(err,db){
            db.collection('comments',function(err,commCollec){
                commCollec.insert(cmnt,function(err){
                    //console.log("in promise of addPost");
                    if(err){
                        reject(err);
                        //db.close();
                    }    
                    else{
                        resolve(cmnt);
                        //db.close();
                    }
                });
            });
        });
    });
};


removeCommentId=function(cid){
    return new Promise(function(resolve,reject){
        mongo.connect(url,function(err,db){
            if(err) throw(err);
            db.collection('comments',function(err,commCollec){
                if(err) throw(err);
                commCollec.remove({_id: ObjectId(cid)},function(err,docs){
                    if(err) reject(err);
                    resolve();
                    db.close();            
                });
            });
        });
    });
};

findCommentId=function(cid){
    return new Promise(function(resolve,reject){
        mongo.connect(url,function(err,db){
            if(err) throw(err);
            db.collection('comments',function(err,commCollec){
                commCollec.find({_id: ObjectId(cid)}).toArray(function(err,docs){
                    if(err) reject(err);
                    resolve(docs);
                    db.close();
                });
            });
        });
    });
};


router.post('/likethiscomment',function(req,res,data){              //comment whose id comes is deleted
    var cmnt;                                                       //if user has liked it already            
    findCommentId(req.body.data.cid).then(function(result){         //user is spliced off else user added in liked    
        console.log(result);
        cmnt=result[0];
        return removeCommentId(cmnt._id);
    }).then(function(){
        console.log("removed the comment");
        var junk=0;
        for(var j=0;j<cmnt.liked_by.length;j++)
        {
            if(cmnt.liked_by[j]==req.body.data.user)
            {
                junk=998;
                cmnt.liked_by.splice(j, 1);
            }
        }
        if(junk==0){
            cmnt.liked_by.push(req.body.data.user);
        }
        return addCommentId(cmnt);
    }).then(function(result){
        // console.log(result);
        res.send();   
    }).catch(function(err){
        console.log(err);
    });
});



findPostUser=function(user){                                        //finding all posts of given user
    return new Promise(function(resolve,reject){
        Posts.find({username: user},function(err,posts){  
            //console.log("in promise of findPostUser");
            if(posts==null){
                reject(err);
            }    
            else{
                resolve(posts);
            }
        });
    });
};

findComment=function(post){                                            //finding all comments on those posts     
    return new Promise(function(resolve,reject){
        mongo.connect(url,function(err,db){
            db.collection('comments',function(err,commCollec){
                commCollec.find({post_id:post._id.toString()}).toArray(function(err,docs){
                    if(err) reject(err);
                    resolve(docs);
                    db.close();
                });
            });
        });
    });
};


friendsofuser=function(user)                        //finding friends of users
{
    return new Promise(function(resolve,reject){
        mongo.connect(url, function(err,db){                 
            if(err) throw(err);
            db.collection('friends',function(err,friendsCollec){
                if(err) throw(err);
                //console.log("in promise of friendsofuser");
                friendsCollec.find({$or:[{"user1":user},{"user2":user}]})
                .toArray(function(err,docs){
                    if(err) reject(err);
                    resolve(docs);
                });
            });
        });
    });
    
};

//=-----------------prepare home of user


function posts_of_user(req,res,next,user,data,callback)         //returning all posts of given user
{
    var response = {};
    var p=[];
    var postarr=[];
    var index=0;
    var count=0;
    console.log("in postsofuser");
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        findPostUser(user).then(function(result){
            for(var i=0;i<result.length;i++){
                p.push(findComment(result[i]));
            }
            for(var i=0;i<result.length;i++){
                postarr[i]={
                    _id: result[i]._id,
                    username:result[i].username,
                    post:result[i].post,
                    posted_at:result[i].posted_at,
                    liked_by:result[i].liked_by,
                    commented_by:[]
                };
                index++;
            }
            //  console.log("postarr: ",x,"th iteration", postarr);
            return Promise.all(p);   
        }).then(function(data){
            for(var i=0;i<postarr.length;i++)
            {
                if(data[i]!=[])
                {
                    for(var j=0;j<data[i].length;j++){
                        var datacomm={
                            user: data[i][j].username,
                            comment: data[i][j].comment,
                            liked_by:data[i][j].liked_by,
                            cid: data[i][j]._id
                        };
                        //console.log("datacomm", datacomm);
                        postarr[i].commented_by.push(datacomm);
                        //console.log("postarr[i].commented_by", postarr[i].commented_by[j]);
                    }
                }
            }
            if(postarr==null){
                response = {
                    "done": true,
                    "array_post":postarr,
                    "error":true
                };      
            }
            data=postarr;
            if(user==req.session.user){
                response = {
                    "done": true,
                    "array_post":postarr,
                    "error":false
                };       
            }
            else{
                response = {
                    "done": false,
                    "array_post":postarr,
                    "error":false
                };
            }
            callback(response);
            // return(postarr);
        }).catch(function(err){
            console.log(err);
        });
    });
};

var base64Img = require('base64-img');

router.get('/home', function(req, res, next) {          //preparing home of user
    //console.log(__dirname);
    //var url={__dirname}.toString()+"/public/images/${req.session.user}.jpg";
    //console.log(__dirname);
    var imgpath="/home/asim/Desktop/MEAN/fb/public/images/"+req.session.user;
    /*mongo.connect(url,function(err,db){
        if(err) throw(err);
        
        db.collection('dp',function(err,dpCollec){
            dpCollec.find({user:req.session.user}).toArray(function(err,docs){
                if(err) throw(err);
                console.log(docs);
                if(docs[0]!=null){
                    imgpath=docs[0].dppath;
                }
            });
        });*/
        //});
        var totalusers=[];
        var arr=[];
        var data;
        var done=false;
        friendsofuser(req.session.user).then(function(result){
            for(var i=0;i<result.length;i++)
            {
                if(result[i].user1==req.session.user)
                {
                    totalusers.push(result[i].user2);
                }else if(result[i].user2==req.session.user){
                    totalusers.push(result[i].user1);
                }
            }
            totalusers.push(req.session.user);
            for(var i=0;i<totalusers.length;i++)
            {
                posts_of_user(req,res,next,totalusers[i],data,function(response){       //calling func to get
                    var xox=res;
                    arr.push(response.array_post);                                 //posts of users         
                    //console.log(i-1,totalusers.length-1);
                    if(response.done){
                        console.log(arr);
                        //arr[0][4]="./public/images/"+req.session.user;
                        var resp={arr:arr,
                                dp: null,
                                dplikes: [],
                                dpcmnts: []
                            };
                            if(imgpath!=null){
                                base64Img.base64(imgpath, function(err, data) {
                                    // console.log(data);    //prints image
                                    resp.dp=data;
                                    mongo.connect(url,function(err,db){
                                    //console.log(url);
                                    if(err) throw(err);
                                    db.collection('dp',function(err,dpCollec){
                                        dpCollec.find({username:req.session.user}).toArray(function(err,docs){
                                            if(docs[0]!=null){
                                                resp.dplikes=docs[0].liked_by;
                                                resp.dpcmnts=docs[0].commented_by;
                                            }                               
                                           xox.send(resp);
                                });
                            });
                            });
                            });
                        }
                    }
                    });
                }
            });
        });
        
        router.post('/like-dp',function(req,res,next){
            console.log(req.body.dpuser);
            mongo.connect(url,function(err,db){
                //console.log(url);
                if(err) throw(err);
                db.collection('dp',function(err,dpCollec){
                    dpCollec.find({username:req.body.dpuser}).toArray(function(err,docs){
                        if(err) throw(err);
                        console.log("finding dp");
                        console.log(docs);
                        if(docs.length==0){
                            console.log("in null")
                            var toinsert={
                                username: req.body.dpuser,
                                liked_by: [req.session.user]
                            }
                            dpCollec.insert(toinsert,function(err,docs){
                                if(err) throw(err);
                                console.log("adding 1st like on dp");
                            });
                        }
                        else{
                            var flagdp=false;
                            console.log("adding 2nd.. like on dp");
                            for(var i=0;i<docs[0].liked_by.length;i++){
                                if(docs[0].liked_by[i]==req.session.user){
                                    docs[0].liked_by.splice(i,1);
                                    flagdp=true;
                                }
                            }
                            if(!flagdp)
                            docs[0].liked_by.push(req.session.user);
                            
                            var myquery={username: req.body.dpuser};
                            var newvalues=docs[0];
                            console.log(newvalues);
                            db.collection("dp").updateOne(myquery, newvalues, function(err, res) {
                                if (err) throw err;
                                console.log("1 document updated");
                                db.close();
                            });     
                        }
                    });
                }); 
            });
        });


router.post('/comment-dp',function(req,res,next){
    console.log(req.body.dpuser);
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        db.collection('dp',function(err,dpCollec){
        
        dpCollec.find({username:req.body.dpuser}).toArray(function(err,docs){
        console.log("dp of user: ",docs[0]);
        var cmnt={
            comment: req.body.comment,
            user: req.session.user 
        };
        docs[0].commented_by.push(cmnt);
        var myquery={username: req.body.dpuser};
        var newvalues=docs[0];
        db.collection("dp").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
    });
            });
        });
    });
});


router.post('/getprofileofuser',function(req,res,next){
    console.log(req.body.data);
    var user=req.body.data;
    var data;
    posts_of_user(req,res,next,user,data,function(response){
        if(response.error || response.array_post==[])
        {
            //console.log("error");
            return res.status(400).send();
        }
        else{
            var imgpath="/home/asim/Desktop/MEAN/fb/public/images/"+req.body.data;
            base64Img.base64(imgpath, function(err, data) {
            
            var respo={
                posts:response.array_post,
                dp:data,
                dplikes:[],
                dpcmnts:[]
            }
            mongo.connect(url,function(err,db){
            //console.log(url);
            if(err) throw(err);
            db.collection('dp',function(err,dpCollec){
                dpCollec.find({username:req.body.data}).toArray(function(err,docs){
                    console.log("likes on dp",docs[0]);
                    if(docs[0]!=null){
                        respo.dplikes=docs[0].liked_by;
                        respo.dpcmnts=docs[0].commented_by;
                    }
                    res.send(respo);
                });
            });
            });
        });
        }
    });  
});


//-----------------------add comment on the post

router.post('/addcomment',function(req,res,next){
    req.body.data.commented_at=new Date();
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        req.body.data.liked_by=[];
        db.collection('comments',function(err,commCollec){
            commCollec.insert(req.body.data,{w:1},function(err,docs){
                if(err) throw(err);
                console.log("Inserted");
            });
        });
    });
});

//-------------------post a post given by user

router.post('/post',function(req,res,next){             //post a post given by user         
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        assert.equal(null,err);
        db.collection('posts',function(err,postsCollec){
            if(err){
                res.status(400).send();
            }
            var postit={
                post: req.body.newPost.post,
                username: req.body.newPost.username,
                date: new Date(),
                liked_by: []
            };
            postsCollec.insert(postit,{w:1},function(err){
                //console.log(req.body.newPost);
                res.send("inserted");
            });
        });
    });
});

var fs=require('fs');
var upload=multer({dest: 'uploads/'});
const replace = require('replace-in-file');

router.post('/upload-dp',upload.any(),function(req,res,next){
    console.log(req.files);
    mongo.connect(url,function(err,db){
        if(err) throw(err);
        assert.equal(null,err);
        db.collection('dp',function(err,dpCollec){
            if(err){
                throw(err);
            }
            dpCollec.remove({user:req.session.user}, function(err, result) {
                if (err) {
                    console.log(err);
                }
                //console.log(result);
                var dpdata={
                    username: req.session.user,
                    commented_by:[],
                    liked_by: [],
                    commented_by: []
                }
                dpCollec.insert(dpdata,function(err){
                    if(err) throw(err);
                    console.log("dp record inserted");
                });
                dpCollec.find({user:req.session.user}).toArray(function(err,docs){
                    if(err) throw(err);
                    console.log("finding dp");
                    console.log(docs);
                });
            });
        });
    });
/*fs.stat('./public/images/'+req.session.user,function(err,stat){      // was checking if user already has a dp
                                                                     but his dp will be replaced automatically now
        console.log(req.session.user);
        if(err == null) {
            var options = {
                //Single file or glob 
                files: 'path/to/file',
            }
            console.log('File exists');
        } else if(err.code == 'ENOENT') {
            // file does not exist
            console.log('File doesnt exist');
            //fs.writeFile('log.txt', 'Some log\n');
        } else {
            console.log('Some other error: ', err.code);
        }
    });*/
    if(req.files){
        var file=req.files;
        var filename=req.session.user;
        console.log(file[0].path);
        fs.rename(file[0].path,'public/images/'+filename,function(err){
            if(err)throw(err);
            console.log("File uploaded to server");
        });
    }
});


router.put('/login', function(req, res, next) { //finding user of same username
    //console.log(req.body.data);                  //if found password is compared by bcrypt 
    mongo.connect(url,function(err, db){            //if matches then a token is generated for the user
        if(err) throw(err);
        assert.equal(null, err);                            //else error status is send back
        db.collection('users',function(err,usersCollec){
            usersCollec.findOne({username: req.body.data.username},function(err,user){
                if(user)
                {
                    bcrypt.compare(req.body.data.password, user.password,function(err,result){
                        if(result)
                        {   
                            var client="../client";
                            var mytoken=jwt.encode(user,secret);
                            req.session.user=req.body.data.username;
                            //console.log(req.session.user);
                            res.render('home.html',{token:mytoken});
                            //console.log("home send kroji");
                            //res.sendFile('/home.html',{ root: client });
                        }
                        else{
                            return res.status(400).send();
                        }
                    });
                }
                else
                {
                    return res.status(400).send();
                }        
            });
        });
    });
});

router.post('/signup', function(req, res, next) {       //checking that no user exists of same username
    console.log(req.body.data.username);                //if dont  user is entered in db    
    var pswd=req.body.data.password;                    //and pass is inserted also but after hashing by bcrypt
    var dt=req.body.data.dob;
    console.log(dt);
    mongo.connect(url,function(err, db){
        if(err) throw(err);
        assert.equal(null, err);
        db.collection('users',function(err,usersCollec){
            usersCollec.findOne({username: req.body.data.username},function(err,user){
                if(user)
                {
                    return res.status(400).send();
                }
                else
                {
                    bcrypt.genSalt(10,function(err,salt){
                        bcrypt.hash(pswd,salt,function(err,hash){
                            if(err)
                            throw(err);
                            req.body.data.password=hash;       
                            db.collection('users',function(err,usersCollec){
                                usersCollec.insert(req.body.data,{w:1},function(err){
                                    if(err) throw(err);
                                    else
                                    console.log("user inserted");
                                    return res.send();
                                });
                            });
                        });
                    });
                }
            });
        });
    });       
});


module.exports = router;