var express = require('express');
var router = express.Router();

var client="./client";

router.get('/', function(req, res, next) {  
    res.sendFile('/index.html',{ root: client });   
});;



module.exports = router;