var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({



    category: {type:String, unique:true},
    products:[{
        type: Schema.Types.ObjectId, ref: 'products'}],
        imgCat: String,
        filename:String,
        originalname: String,
   
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('category', CategorySchema);