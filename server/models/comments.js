var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var promise = mongoose.connect('mongodb://localhost:27017/fb', {
  useMongoClient: true,
  /* other options */
});

var schema= new Schema(
{
username:{type: String, required: true},
post_id:{type: String, required: true},
comment:{type: String, required: true},
commented_at: {type: Date, required: true},
liked_by: {type: Array}
});

var comments = mongoose.model('Comments', schema);

/*
var asim = new comments({
username: "asim",
post_id: "5967afbf4e713e1c2987fd3f",
comment: "Commented",
liked_by: [],
commented_at: "1996-12-18"
}).save(function(err,data){
    if(err) throw(err);
    console.log(data);
    console.log("Inserted");
});
*/
module.exports=mongoose.model('comments', schema)