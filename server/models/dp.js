var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var promise = mongoose.connect('mongodb://localhost:27017/fb', {
  useMongoClient: true,
  /* other options */
});

var schema= new Schema(
{
username:{type: String, required: true},
liked_by: {type: Array},
commented_by:{type: Array}
});

var dp = mongoose.model('Dp', schema);
/*
var asim = new dp({
username: "asim",
liked_by: [],
commented_by: []
}).save(function(err,data){
    if(err) throw(err);
    console.log(data);
    console.log("Inserted");
});
*/
module.exports=mongoose.model('dp', schema)