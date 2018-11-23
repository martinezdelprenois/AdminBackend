var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PromoSchema = new Schema({



    name: {type:String, unique:true},
        imgURL: String,
        filename: {type:String},
        originalname: String,
   
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('promotions', PromoSchema);