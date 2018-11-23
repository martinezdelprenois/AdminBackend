var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HamperSchema = new Schema({



    name: {type:String, unique:true},
        imgHamper: String,
        filename:String,
        originalname: String,
        price: Number,
   
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('hampers', HamperSchema);