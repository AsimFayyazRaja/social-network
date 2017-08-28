var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var promise = mongoose.connect('mongodb://localhost:27017/fb', {
  useMongoClient: true,
  /* other options */
});

var schema= new Schema(
{
user1:{type: String, required: true},
user2:{type: String, required: true},
seen1:{type: Boolean, required: true },
seen2:{type: Boolean, required: true },
messages: {type: Array}
});

var chats = mongoose.model('Chats', schema);
/*
var asim = new chats({
user1: "asim",
user2: "raja",
seen1: false,
seen2: false,
messages: []
}).save(function(err,data){
    if(err) throw(err);
    console.log(data);
    console.log("Inserted");
});
*/
module.exports=mongoose.model('chats', schema)
