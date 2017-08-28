var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var promise = mongoose.connect('mongodb://localhost:27017/fb', {
  useMongoClient: true,
  /* other options */
});

var schema= new Schema(
{
user1:{type: String, required: true},
user2:{type: String, required: true}
});

var friends = mongoose.model('Friends', schema);
/*
var asim = new friends({
user1: "asim",
user2: "raja"
}).save(function(err,data){
    if(err) throw(err);
    console.log("Inserted");
});
*/
module.exports=mongoose.model('friends', schema)