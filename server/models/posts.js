var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var promise = mongoose.connect('mongodb://localhost:27017/fb', {
  useMongoClient: true,
  /* other options */
});

var schema= new Schema(
{
username:{type: String, required: true},
post:{type: String, required: true},
posted_at: {type: Date, required: true},
liked_by: {type: Array}
});

var posts = mongoose.model('Posts', schema);
/*
var asim = new posts({
username: "asim",
post: "lol",
liked_by: ["asim", "ali"],
posted_at: "1996-12-18"
}).save(function(err,data){
    if(err) throw(err);
    console.log(data);
    console.log("Inserted");
});

var asim = new posts({
username: "asim",
post: "I am in lalaland",
liked_by: ["asim", "ali"],
posted_at: "1996-12-18"
}).save(function(err,data){
    if(err) throw(err);
    console.log(data);
    console.log("Inserted");
});

var asim = new posts({
username: "asim",
post: "huihuihui",
liked_by: ["asim", "ali"],
posted_at: "1996-12-18"
}).save(function(err,data){
    if(err) throw(err);
    console.log(data);
    console.log("Inserted");
});

var asim = new posts({
username: "asim",
post: "I am Asim",
liked_by: ["asim", "ali"],
posted_at: "1996-12-18"
}).save(function(err,data){
    if(err) throw(err);
    console.log(data);
    console.log("Inserted");
});
*/

module.exports=mongoose.model('posts', schema)
