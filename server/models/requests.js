var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var promise = mongoose.connect('mongodb://localhost:27017/fb', {
  useMongoClient: true,
  /* other options */
});

var schema= new Schema(
{
sent_by: {type: String, required: true},
sent_to: {type: String, required: true},
seen: {type: Boolean, required: false}
});

var requests = mongoose.model('Requests', schema);
/*
var asim = new requests({
sent_by: "raja",
sent_to: "asim",
seen: false
}).save(function(err,data){
    if(err) throw(err);
    console.log("Inserted");
});
*/
module.exports=mongoose.model('requests', schema)