var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var promise = mongoose.connect('mongodb://localhost:27017/fb', {
  useMongoClient: true,
  /* other options */
});

var schema= new Schema(
{
username:{type: String, required: true},
password: {type: String, required: true},
first_name: {type: String, required: true},
last_name: {type: String, required: true},
dob: {type: Date}
});

var users = mongoose.model('Users', schema);
/*
var asim = new users({
username: "asim@asim",
password: "asim@asim",
first_name: "asim",
last_name: "asim",
dob: "1996-12-18"
}).save(function(err,data){
    if(err) throw(err);
    console.log("Inserted");
});
*/
module.exports=mongoose.model('users', schema)